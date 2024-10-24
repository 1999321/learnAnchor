"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const anchor = __importStar(require("@coral-xyz/anchor"));
const web3_js_1 = require("@solana/web3.js");
const chai_1 = require("chai");
require("dotenv/config");
console.log('puppet');
describe('puppet', () => {
    console.log(anchor.AnchorProvider);
    const provider = anchor.AnchorProvider.env();
    anchor.setProvider(provider);
    const puppetProgram = anchor.workspace.Puppet;
    const puppetMasterProgram = anchor.workspace
        .PuppetMaster;
    const puppetKeypair = web3_js_1.Keypair.generate();
    it('Does CPI!', () => __awaiter(void 0, void 0, void 0, function* () {
        yield puppetProgram.methods
            .initialize()
            .accounts({
            puppet: puppetKeypair.publicKey,
            user: provider.wallet.publicKey,
        })
            .signers([puppetKeypair])
            .rpc();
        yield puppetMasterProgram.methods
            .pullStrings(new anchor.BN(42))
            .accounts({
            //puppetProgram: puppetProgram.programId,
            puppet: puppetKeypair.publicKey,
        })
            .rpc();
        let data = yield puppetProgram.account.data.fetch(puppetKeypair.publicKey);
        console.log(data.data.toNumber());
        (0, chai_1.expect)((yield puppetProgram.account.data.fetch(puppetKeypair.publicKey)).data.toNumber()).to.equal(42);
    }));
});
