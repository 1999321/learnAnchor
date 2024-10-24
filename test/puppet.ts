import * as anchor from '@coral-xyz/anchor'
import { Program } from '@coral-xyz/anchor'
import { Keypair } from '@solana/web3.js'
import { expect } from 'chai'
import { Puppet } from '../target/types/puppet'
import { PuppetMaster } from '../target/types/puppet_master'
import 'dotenv/config'
console.log('puppet')
describe('puppet', () => {
    console.log(anchor.AnchorProvider)
    const provider = anchor.AnchorProvider.env()
    anchor.setProvider(provider)


    const puppetProgram = anchor.workspace.Puppet as Program<Puppet>
    const puppetMasterProgram = anchor.workspace
        .PuppetMaster as Program<PuppetMaster>

    const puppetKeypair = Keypair.generate()

    it('Does CPI!', async () => {
        
        await puppetProgram.methods
        .initialize()
        .accounts({
            puppet: puppetKeypair.publicKey,
            user: provider.wallet.publicKey,
        })
        .signers([puppetKeypair])
        .rpc()

        await puppetMasterProgram.methods
        .pullStrings(new anchor.BN(42))
        .accounts({
            //puppetProgram: puppetProgram.programId,
            puppet: puppetKeypair.publicKey,
        })
        .rpc()
        let data = await puppetProgram.account.data.fetch(puppetKeypair.publicKey)
        console.log(data.data.toNumber())
        expect(
        (
            await puppetProgram.account.data.fetch(puppetKeypair.publicKey)
        ).data.toNumber()
        ).to.equal(42)
    })
})