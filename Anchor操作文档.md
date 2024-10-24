# Anchor操作文档

## 基本文档

https://www.anchor-lang.com/docs/installation

### 本文所用机器（docker）的环境：

`Win10` 专业版本

docket desktop: `v4.33.1`

vs code插件: `docker`，`remote-ssh`, `dev-containers`, `wsl`

docker image: rust@1.80.1

`solana-cli` 1.18.23

`anchor`: `v0.30.1`

### 安装

> `solana`

```shell
sh -c "$(curl -sSfL https://release.anza.xyz/stable/install)"
```

```shell
export PATH="$HOME/.local/share/solana/install/active_release/bin:$PATH"
```

[参考](https://solana.com/docs/intro/installation)

> `anchor`

```shell
cargo install --git https://github.com/coral-xyz/anchor --tag v0.30.1 anchor-cli
```

如果遇到安装错误，[参考](https://github.com/coral-xyz/anchor/issues/3131)，这个错误是因为下面命令导致的:

```shell
cargo install --git https://github.com/coral-xyz/anchor --tag v0.30.1 anchor-cli --locked
```

和其中的`--locked`有关。

如果`solana-cli`的安装版本过低，运行下面命令:

```shell
anchor test
anchor build
```

会出现类似的错误:

```
no such subcommand "+bpf"
```

[参考](https://github.com/solana-labs/solana/issues/27902)

```shell
docker run -it -d -p 80:8080 --name anchor rust:latest
```



### 建立项目

参照[该文](https://www.anchor-lang.com/docs/cross-program-invocations)

至此建立了一个基本的`solana program`代码。

如果想展开那些宏来看，可以使用:

```shell
cargo expand --lib <libName>
```

比如:

```shell
#[program]
mod puppet_master {
    use super::*;
    pub fn pull_strings(ctx: Context<PullStrings>, data: u64) -> Result<()> {
        let cpi_program = ctx.accounts.puppet_program.to_account_info();
        let cpi_accounts = SetData {
            puppet: ctx.accounts.puppet.to_account_info(),
        };
        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
        puppet::cpi::set_data(cpi_ctx, data)
    }
}


#[derive(Accounts)]
pub struct PullStrings<'info> {
    #[account(mut)]
    pub puppet: Account<'info, Data>,
    pub puppet_program: Program<'info, Puppet>,
}
```

需要到其项目的目录下运行:

```shell
cargo expand --lib puppet_master
```

如果想展开`#[derive(Accounts)]`、`#[account(mut)]`这些，那么把其移到`puppet_master`里面。

**注：在`anchor init`命令遇到错误也无关大雅，其实际上不影响。**

`Anchor.toml`:

```toml
[toolchain]

[features]
resolution = true
skip-lint = false

[programs.localnet]
puppet = "4TTQ3EVSM6D2zhQKSxZ4CtPAKTBQDockJRdH76c8u88e"#puppet程序ID
puppet_master = "7c4QnAEXSaiiPCo6E64eLjTBpXoFM7kgdHfmAb5bdryZ"#puppet_master程序ID

[registry]
url = "https://api.apr.dev"

[provider]
cluster = "Localnet"#部署网络
wallet = "~/.config/solana/id.json"#keypairs所处的文件位置

[scripts]#定义的测试命令
test = "yarn run ts-mocha -p ./tsconfig.json -t 1000000 tests/**/*.ts"
```

程序ID需要部署的程序ID（链上）、`declare_id!`、`Anchor.toml`三者需要一致。

Q: 如果部署到链上发现其并不一致怎么办？

```shell
solana program deploy --program-id <PROGRAM_ID> --url localhost
```

或者

```shell
anchor deploy
```

之后获得了部署的地址后，再在`declare_id!`、`Anchor.toml`两者更新，之后再一次运行:

```shell
anchor deploy
```

这一步应该是覆盖部署，即更新program。

这里的`--url localhost`是表明使用本地的网络节点。

其还有`--url devnet`、`--url testnet`等，这两个表示公共测试网，`solana-cli`默认使用主网。

```shell
anchor build
```

运行上面命令，即把项目建立起来了，更具体可以关注其/target/deploy文件夹下面的后缀为`.so`的文件，这是`solana`的program部署文件，一般部署需要几百到上千条交易，故而通常使用`cli`的形式进行部署。

### 测试项目

```shell
anchor test
```

该指令实则是运行：

```shell
yarn run ts-mocha -p ./tsconfig.json -t 1000000 tests/**/*.ts
```

作者并没有使用`ts-mocha`进行测试，也即没有直接使用`anchor test`进行测试，感兴趣的可以参考`这个[项目](https://github.com/WrRaThY/anchor-example/tree/master)

作者使用`mocha`来进行测试。

package.json:

```json
{
  "dependencies": {
    "@coral-xyz/anchor": "^0.30.1",
    "dotenv": "^16.4.5",
    "yarn": "^1.22.22"
  },
  "devDependencies": {
    "@types/chai": "^4.3.19",
    "@types/mocha": "^10.0.7",
    "@types/sinon": "^17.0.3",
    "chai": "^4.5.0",
    "mocha": "^10.7.3",
    "sinon": "^18.0.0",
    "typescript": "^5.5.4"
  },
  "scripts": {
    "test": "mocha",
    "build": "tsc"
  }
}
```

tsconfig.json:

```shell
tsc init
```

**注：`chai`的^5.0.0版本` only esm`，会导致和项目使用的`commonjs`冲突，故而使用其`4.x.x`版本，[参考](https://github.com/chaijs/chai/issues/1578)**

建立`test`文件夹，在其下建立`puppet.ts`文件，根据上节提到的文档里面的`puppet.ts`内容复制到新建文件。

然后是：

```shell
npm run build
```

```shell
npm run test
```

`build`是运行`tsc`生成`js`文件，然后运行`test`对生成的`js`文件测试。

然后你会发现出错了！那肯定出错，对链的内容是一点还没有建立呢！当然也可能出现下面这个错误:

```typescript
await puppetMasterProgram.methods
.pullStrings(new anchor.BN(42))
.accounts({
    puppetProgram: puppetProgram.programId, //这一行因为类型是字面量而报错，注释掉即可
    puppet: puppetKeypair.publicKey,
})
```

那么链的信息如何建立呢？

#### 建立链内容

[参考](https://solana.com/developers/guides/getstarted/solana-test-validator)

```shell
solana-test-validator
```

建立本地测试验证器。

```shell
solana-keygen new
```

在`~/.config/solana/id.json`生成账户，获得其`pubkey`

```shell
solana airdrop 10 <pubkey> --url loaclhost
```

如果不想要`--url loaclhost`，则：[参考](https://stackoverflow.com/questions/71167338/solana-airdrop-error-need-help-to-fix-my-problem)

```shell
solana config set --url localhost
```

改`localhost`为默认网络。

```shell
anchor deploy
```

记录其`Program Id`，不记住也无所谓，可以通过/target/deploy文件夹下获得其`json`文件，该文件是其Program Id的相关信息，可以通过：[参考](https://solana.stackexchange.com/questions/5570/error-the-declared-program-id-does-not-match-the-actual-program-id)

```shell
solana-keygen pubkey target/deploy/my_program-keypair.json
```

如果遇到错误`[Error: The declared program id does not match the actual program id](https://solana.stackexchange.com/questions/5570/error-the-declared-program-id-does-not-match-the-actual-program-id)`，那么修改`declare_id!`、`Anchor.toml`两处的`program id`，然后再运行:

```shell
anchor deploy
```

至此，链内容建立完成。

运行：

```shell
npm run build
```

```shell
npm run test
```

完成了测试。

欢迎补充和指正。