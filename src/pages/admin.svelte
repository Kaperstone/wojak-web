<script>
export let account
export let token
export let signer
export let provider
export let connected
export let nonce
export let stakelocker

import struct from "./../json/admin.json"
let treasury
let show = 0
let status = "Waiting for new status"
let tx_status = "None"
let usdcBalance = "0",
    booBalance = "0",
    creditBalance = "0",
    screamBalance = "0",
    tarotBalance = "0",
    bifiBalance = "0",
    crvBalance = "0",
    keeper_usdcbalance = "0",
    BOOForxBOO = "0",
    snonce = 0, missiles, completed = 0

setInterval(()=>{
    if(snonce > 0) {
        let z = nonce - snonce
        let c = (100 / (32 / z))
        missiles.style.width = c + "%"
        completed = c.toFixed(0)
        if(snonce + 32 == nonce) {
            snonce = 0
            completed = 0
        }
    }
},1000)

async function init() {
    if(typeof token.contracts !== "undefined") {
        treasury = new ethers.Contract(token.contracts.treasury.address, token.contracts.treasury.abi, signer)

        let y=0, name
        let collector = [], index = 0
        for(let x in struct.contracts) {
            let differ
            for(let q in struct.contracts[x].roles)
                for(let z in struct.contracts[x].roles[q].target) {
                    differ = struct.contracts[x].roles[q].target[z].split(".")
                    struct.contracts[x].roles[q].result[z] = {
                        name: struct.contracts[x].roles[q].target[z],
                        address: token[differ[0]][differ[1]].address,
                        response: "Updating"
                    }
                }
            for(let z in struct.contracts[x].functions) 
                for(let k in struct.contracts[x].functions[z].inputs) 
                    if(struct.contracts[x].functions[z].inputs[k].type == "should-equal-this")
                        struct.contracts[x].functions[z].inputs[k].response = null;
        }

        for(let x in struct.contracts) {
            struct.contracts[x].id = y++
            struct.contracts[x].show = false

            // Storing pointers
            name = struct.contracts[x].name
            token.contracts[name].call = new ethers.Contract(token.contracts[name].address, token.contracts[name].abi, signer)
        
            // setAddress
            for(let z in struct.contracts[x].functions)
                for(let k in struct.contracts[x].functions[z].inputs)
                    if(struct.contracts[x].functions[z].inputs[k].type == "should-equal-this")
                        collector[index++] = token.contracts[name].call[struct.contracts[x].functions[z].inputs[k].equal]();

            // Getting .roles[q].results
            let differ
            for(let q in struct.contracts[x].roles) {
                for(let z in struct.contracts[x].roles[q].target) {
                    differ = struct.contracts[x].roles[q].target[z].split(".")
                    struct.contracts[x].roles[q].result[z] = {
                        name: struct.contracts[x].roles[q].target[z],
                        address: token[differ[0]][differ[1]].address,
                        keccak256: struct.contracts[x].roles[q].keccak256,
                        response: null
                    }
                    collector[index++] = token.contracts[name].call.hasRole(
                        struct.contracts[x].roles[q].keccak256,
                        token[differ[0]][differ[1]].address
                    )
                }
                collector[index++] = token.contracts[name].call.getRoleMemberCount(struct.contracts[x].roles[q].keccak256)
            }
        }

        Promise.all(collector).then(values => {
            index = 0
            for(let x in struct.contracts) {
                struct.contracts[x].todo = 0
                for(let z in struct.contracts[x].functions) {
                    for(let k in struct.contracts[x].functions[z].inputs) {
                        if(struct.contracts[x].functions[z].inputs[k].type == "should-equal-this") {
                            struct.contracts[x].functions[z].inputs[k].response = values[index]
                            if(values[index] !== token.contracts[struct.contracts[x].functions[z].inputs[k].default].address) struct.contracts[x].todo++
                            index ++
                        }
                    }
                }
                let differ
                for(let q in struct.contracts[x].roles) {
                    for(let z in struct.contracts[x].roles[q].target) {
                        differ = struct.contracts[x].roles[q].target[z].split(".")
                        struct.contracts[x].roles[q].result[z].response = values[index]
                        if(!values[index]) struct.contracts[x].todo++
                        index ++
                    }
                    struct.contracts[x].roles[q].count = values[index++]
                }
            }
            
        })
        
        const usdc = new ethers.Contract(token.tokens.usdc.address, token.tokens.usdc.abi, provider)
        usdcBalance = ethers.utils.formatUnits(await usdc.balanceOf(account.address), 6)
        const boo = new ethers.Contract(token.tokens.boo.address, token.tokens.boo.abi, provider)
        booBalance = ethers.utils.formatUnits(await boo.balanceOf(account.address), 18)
        const credit = new ethers.Contract(token.tokens.credit.address, token.tokens.credit.abi, provider)
        creditBalance = ethers.utils.formatUnits(await credit.balanceOf(account.address), 18)
        const scream = new ethers.Contract(token.tokens.scream.address, token.tokens.scream.abi, provider)
        screamBalance = ethers.utils.formatUnits(await scream.balanceOf(account.address), 18)
        const tarot = new ethers.Contract(token.tokens.tarot.address, token.tokens.tarot.abi, provider)
        tarotBalance = ethers.utils.formatUnits(await tarot.balanceOf(account.address), 18)
        const bifi = new ethers.Contract(token.tokens.bifi.address, token.tokens.bifi.abi, provider)
        bifiBalance = ethers.utils.formatUnits(await bifi.balanceOf(account.address), 18)
        const crv = new ethers.Contract(token.tokens.crv.address, token.tokens.crv.abi, provider)
        crvBalance = ethers.utils.formatUnits(await crv.balanceOf(account.address), 18)
        keeper_usdcbalance = ethers.utils.formatUnits(await usdc.balanceOf(token.contracts.keeper.address), 6)

        const xboo = new ethers.Contract(token.tokens.xboo.address, token.tokens.xboo.abi, provider)
        BOOForxBOO = ethers.utils.formatUnits(await xboo.BOOForxBOO(ethers.utils.parseUnits("1")), 18)

        struct.contracts[0].show = true
    }
}

if(connected) init()
window.dispatch = () => init()

function changeTab() {
    show = parseInt(this.getAttribute("x"))
}

async function grantRole() {
    let fname = this.getAttribute("fname")
    let address = this.getAttribute("address")
    let keccak256 = this.getAttribute("keccak256")

    try {
        tx_status = "Waiting for tx confirm"
        const tx = await token.contracts[fname].call.grantRole(keccak256, address)
        tx_status = "Processing tx <a href='https://goerli.etherscan.io/tx/"+tx.hash+"' target='_blank'>"+tx.hash+"</a>"
        await tx.wait()
        tx_status = "tx finished <a href='https://goerli.etherscan.io/tx/"+tx.hash+"' target='_blank'>"+tx.hash+"</a>"
    } catch(error) {
        tx_status = error
    }
}

async function revokeRole() {
    let fname = this.getAttribute("fname")
    let address = this.getAttribute("address")
    let keccak256 = this.getAttribute("keccak256")

    try {
        tx_status = "Waiting for tx confirm"
        const tx = await token.contracts[fname].call.revokeRole(keccak256, address)
        tx_status = "Processing tx <a href='https://goerli.etherscan.io/tx/"+tx.hash+"' target='_blank'>"+tx.hash+"</a>"
        await tx.wait()
        tx_status = "tx finished <a href='https://goerli.etherscan.io/tx/"+tx.hash+"' target='_blank'>"+tx.hash+"</a>"
    } catch(error) {
        tx_status = error
    }
}

const gUSDC = new ethers.Contract("0xD87Ba7A50B2E7E660f678A895E4B72E7CB4CCd9C", ["function allocateTo(address _owner, uint256 value) public"], signer)
async function makeMeRich() {
    try {
        const tx = await gUSDC.allocateTo("0xB14Ba501390A89A9E8e6C4E2f8ef95e3124B2119", ethers.utils.parseUnits("200000000.0",6))
        await tx.wait();
    } catch (error) {status = error}
}
let pair = "0x0"
async function createPair() {
    const factory = new ethers.Contract(token.swap.factory.address, token.swap.factory.abi, signer)
    const tx = await factory.createPair(token.contracts.token.address, token.tokens.usdc.address)
    await tx.wait()
}

async function getPair() {
    const factory = new ethers.Contract(token.swap.factory.address, token.swap.factory.abi, signer)
    pair = await factory.getPair(token.contracts.token.address, token.tokens.usdc.address)
}

async function setAddress() {
    let fname = this.getAttribute("fname")
    let address = this.getAttribute("address")
    let command = this.getAttribute("command")

    await token.contracts[fname].call[command](address)
}

async function launchKeeper() {
    try {
        console.log("Trying to perform a keep")
        const keeper = new ethers.Contract(token.contracts.keeper.address, token.contracts.keeper.abi, signer)
        const tx = await keeper.performUpkeep("0x0000000000000000000000000000000000000000000000000000000000000000")
        status = "Tx hash: " + tx.hash
    } catch (error) {
        console.log(error)
    }
}

async function launchDistribution() {
    try {
        console.log("Trying to perform a distribution")
        const keeper = new ethers.Contract(token.contracts.keeper.address, token.contracts.keeper.abi, signer)
        const tx = await keeper.distributeRewards()
        status = "Tx hash: " + tx.hash
    } catch (error) {
        console.log(error)
    }
}

// const TARGETS = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("TARGETS"))
// console.log("TARGETS="+TARGETS)

async function swapFTM2USDC() {
    const router = new ethers.Contract(token.swap.router.address, token.swap.router.abi, signer)

    const tx = await router.swapExactETHForTokens(
        0,
        [token.tokens.wftm.address, token.tokens.usdc.address],
        account.address,
        Date.now() + 1000 * 60 * 10,
        {
            value: ethers.utils.parseEther("7000000"),
            gasLimit: 310000,
            gasPrice: provider.getGasPrice(),
        }
    );
}

async function swapFTM2BOO() {
    const router = new ethers.Contract(token.swap.router.address, token.swap.router.abi, signer)

    const tx = await router.swapExactETHForTokens(
        0,
        [token.tokens.wftm.address, token.tokens.boo.address],
        account.address,
        Date.now() + 1000 * 60 * 10,
        {
            value: ethers.utils.parseEther("1000000"),
            gasLimit: 310000,
            gasPrice: provider.getGasPrice(),
        }
    );
}

async function swapFTM2CREDIT() {
    const router = new ethers.Contract(token.swap.router.address, token.swap.router.abi, signer)

    const tx = await router.swapExactETHForTokens(
        0,
        [token.tokens.wftm.address, token.tokens.credit.address],
        account.address,
        Date.now() + 1000 * 60 * 10,
        {
            value: ethers.utils.parseEther("1000000"),
            gasLimit: 310000,
            gasPrice: provider.getGasPrice(),
        }
    );
}

async function swapFTM2SCREAM() {
    const router = new ethers.Contract(token.swap.router.address, token.swap.router.abi, signer)

    const tx = await router.swapExactETHForTokens(
        0,
        [token.tokens.wftm.address, token.tokens.scream.address],
        account.address,
        Date.now() + 1000 * 60 * 10,
        {
            value: ethers.utils.parseEther("1000000"),
            gasLimit: 310000,
            gasPrice: provider.getGasPrice(),
        }
    );
}

async function swapFTM2TAROT() {
    const router = new ethers.Contract(token.swap.router.address, token.swap.router.abi, signer)

    const tx = await router.swapExactETHForTokens(
        0,
        [token.tokens.wftm.address, token.tokens.tarot.address],
        account.address,
        Date.now() + 1000 * 60 * 10,
        {
            value: ethers.utils.parseEther("1000000"),
            gasLimit: 310000,
            gasPrice: provider.getGasPrice(),
        }
    );
}
async function swapFTM2BIFI() {
    const router = new ethers.Contract(token.swap.router.address, token.swap.router.abi, signer)

    const tx = await router.swapExactETHForTokens(
        0,
        [token.tokens.wftm.address, token.tokens.bifi.address],
        account.address,
        Date.now() + 1000 * 60 * 10,
        {
            value: ethers.utils.parseEther("1000000"),
            gasLimit: 310000,
            gasPrice: provider.getGasPrice(),
        }
    );
}
async function swapFTM2CRV() {
    const router = new ethers.Contract(token.swap.router.address, token.swap.router.abi, signer)

    const tx = await router.swapExactETHForTokens(
        0,
        [token.tokens.wftm.address, token.tokens.crv.address],
        account.address,
        Date.now() + 1000 * 60 * 10,
        {
            value: ethers.utils.parseEther("1000000"),
            gasLimit: 310000,
            gasPrice: provider.getGasPrice(),
        }
    );
}

async function makeLiquidity() {
    const router = new ethers.Contract(token.swap.router.address, token.swap.router.abi, signer)
    await router.addLiquidity(
        token.contracts.token.address,
        token.tokens.usdc.address,
        ethers.utils.parseUnits("88000000", 18), ethers.utils.parseUnits("8800000", 6),
        0, 0,
        token.contracts.keeper.address,
        Date.now() + 1000 * 60 * 10);
}

async function approveLiquidityUSDC() {
    const usdc = new ethers.Contract(token.tokens.usdc.address, token.tokens.usdc.abi, signer)
    await usdc.approve(token.swap.router.address, "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff")
}

async function approveLiquidityWJK() {
    const wjk = new ethers.Contract(token.contracts.token.address, token.contracts.token.abi, signer)
    await wjk.approve(token.swap.router.address, "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff")
}

async function updateKeeperContracts() {
    try {
        const c = new ethers.Contract(token.contracts.manager.address, token.contracts.manager.abi, signer)
        await c.updateKeeperContracts()
    } catch(error) {
        console.log(error)
    }
}
async function updateContract() {
    try {
        const c = new ethers.Contract(token.contracts.manager.address, token.contracts.manager.abi, signer)
        await c.updateContract()
    } catch(error) {
        console.log(error)
    }
}

// let tt
// function start() {
//     let n = nonce
//     clearInterval(tt)
//     tt = setInterval(async () => {
//         const keeper = new ethers.Contract(token.contracts.keeper.address, token.contracts.keeper.abi, signer)
//         try {
//             await keeper.distributeRewards({ nonce: n++ })
//         } catch (e) {}
//     }, 15000)
// }

// function stop() {
//     clearInterval(tt)
// }

function transfer101() {
    const usdc = new ethers.Contract(token.tokens.usdc.address, token.tokens.usdc.abi, signer)
    usdc.transfer(token.contracts.keeper.address, ethers.utils.parseUnits("1000000", 6))
}

function treasuryDisableBoo() {
    const treasury = new ethers.Contract(token.contracts.treasury.address, token.contracts.treasury.abi, signer)
    treasury.disableStrategy(token.tokens.boo.address)
}
function treasuryDisableCredit() {
    const treasury = new ethers.Contract(token.contracts.treasury.address, token.contracts.treasury.abi, signer)
    treasury.disableStrategy(token.tokens.credit.address)
}
function treasuryDisableScream() {
    const treasury = new ethers.Contract(token.contracts.treasury.address, token.contracts.treasury.abi, signer)
    treasury.disableStrategy(token.tokens.scream.address)
}
function treasuryDisableTarot() {
    const treasury = new ethers.Contract(token.contracts.treasury.address, token.contracts.treasury.abi, signer)
    treasury.disableStrategy(token.tokens.tarot.address)
}

function sendToXBOO() {
    const boo = new ethers.Contract(token.tokens.boo.address, token.tokens.boo.abi, signer)
    boo.transfer(token.contracts.boosoy.ib, ethers.utils.parseUnits("2000"))
}
function sendToXCREDIT() {
    const credit = new ethers.Contract(token.tokens.credit.address, token.tokens.credit.abi, signer)
    credit.transfer(token.contracts.creditsoy.ib, ethers.utils.parseUnits("2000"))
}
function sendToXSCREAM() {
    const scream = new ethers.Contract(token.tokens.scream.address, token.tokens.scream.abi, signer)
    scream.transfer(token.contracts.screamsoy.ib, ethers.utils.parseUnits("300"))
}

/*************************/
///////// TREASURY ////////
/*************************/
let treasuryAddStrategyToken, treasuryAddStrategyStrategy
async function treasuryAddStrategy() {
    const tokenAddress = treasuryAddStrategyToken.value
    const strategyAddress = treasuryAddStrategyStrategy.value
    await treasury.addStrategy(tokenAddress, strategyAddress)
}

let treasuryDisableStrategyToken
async function treasuryDisableStrategy() {
    const tokenAddress = treasuryDisableStrategyToken.value
    await treasury.disableStrategy(tokenAddress)
}

let treasuryEnableStrategyToken
async function treasuryEnableStrategy() {
    const tokenAddress = treasuryEnableStrategyToken.value
    await treasury.enableStrategy(tokenAddress)
}

let treasuryChangeStrategyToken, treasuryChangeStrategyStrategy
async function treasuryChangeStrategy() {
    const tokenAddress = treasuryChangeStrategyToken.value
    const strategyAddress = treasuryChangeStrategyStrategy.value
    await treasury.changeStrategy(tokenAddress, strategyAddress)
}

let treasuryEnterMarketToken
async function treasuryEnterMarket() {
    const tokenAddress = treasuryEnterMarketToken.value
    await treasury.enterMarket(tokenAddress)
}

let treasuryExitAndBalanceMarketsToken
async function treasuryExitAndBalanceMarkets() {
    const tokenAddress = treasuryExitAndBalanceMarketsToken.value
    await treasury.exitAndBalanceMarkets(tokenAddress)
}

let treasuryExitMarketToken
async function treasuryExitMarket() {
    const tokenAddress = treasuryExitMarketToken.value
    await treasury.exitMarket(tokenAddress)
}
/*************************/
///////// LOCKER //////////
/*************************/
let lockerAddStrategyToken, lockerAddStrategyStrategy
async function lockerAddStrategy() {
    const tokenAddress = lockerAddStrategyToken.value
    const strategyAddress = lockerAddStrategyStrategy.value
    await stakelocker.addStrategy(tokenAddress, strategyAddress)
}

let lockerDisableStrategyToken
async function lockerDisableStrategy() {
    const tokenAddress = lockerDisableStrategyToken.value
    await stakelocker.disableStrategy(tokenAddress)
}

let lockerEnableStrategyToken
async function lockerEnableStrategy() {
    const tokenAddress = lockerEnableStrategyToken.value
    await stakelocker.enableStrategy(tokenAddress)
}

let lockerChangeStrategyToken, lockerChangeStrategyStrategy
async function lockerChangeStrategy() {
    const tokenAddress = lockerChangeStrategyToken.value
    const strategyAddress = lockerChangeStrategyStrategy.value
    await stakelocker.changeStrategy(tokenAddress, strategyAddress)
}
</script>

<h1>Admin Panel</h1>

{#if typeof token.contracts !== "undefined"}
<div class="w-full word-break">
    <button on:click="{makeMeRich}">USDC Faucet Goerli</button>
    <button on:click="{launchKeeper}">Launch Keeper Manually</button>
    <button on:click="{launchDistribution}">Launch Distribution Manually</button>
    <button on:click="{transfer101}">Transfer to Keeper 101$</button>
    <!-- <br> -->
        <!-- <button on:click="{start}">Start Automatic Distribution</button>
        <button on:click="{stop}">Stahp</button> -->
    <br>
    <button on:click="{updateKeeperContracts}">Manager Update Keeper Tokens/Targets</button>
    <button on:click="{updateContract}">Manager Update Addresses & Roles</button>

    <!-- <button class="w-full" on:click="{main}">LAUNCH MISSLES</button> -->
    <div class="w-full center bg-white border rounded">
        <div bind:this="{missiles}" class="rounded" style="color:white;padding:.1rem 0;width:0%;background:#3894db">
            {completed}%
        </div>
    </div>
    <br>
    status = {@html status}<br>
    tx_status = {@html tx_status}<br>
    <div class="border bg-white shadow-1 rounded my-1 px-1 py-0_5">
        LIQUIDITY FUN<br><br>
        USDC BALANCE: {ethers.utils.commify(parseFloat(keeper_usdcbalance).toFixed(2))}$<br><br>
        BOOForxBOO={BOOForxBOO}<br><br>
        <button on:click="{createPair}">Create Pair</button><button on:click="{getPair}">Get Pair</button> {pair}<br>
        <button on:click="{swapFTM2USDC}">Buy USDC with ETH</button> FTM(7,000,000) => USDC -> BALANCE: {ethers.utils.commify(parseFloat(usdcBalance).toFixed(2))}<br>
        <button on:click="{swapFTM2BOO}">Buy BOO with ETH</button> BOO -> BALANCE: {ethers.utils.commify(parseFloat(booBalance).toFixed(2))} <button on:click="{sendToXBOO}">Send boo to IB contract</button><br>
        <button on:click="{swapFTM2CREDIT}">Buy CREDIT with ETH</button> CREDIT -> BALANCE: {ethers.utils.commify(parseFloat(creditBalance).toFixed(2))} <button on:click="{sendToXCREDIT}">Send credit to IB contract</button><br>
        <button on:click="{swapFTM2SCREAM}">Buy SCREAM with ETH</button> SCREAM -> BALANCE: {ethers.utils.commify(parseFloat(screamBalance).toFixed(2))} <button on:click="{sendToXSCREAM}">Send scream to IB contract</button><br>
        <button on:click="{swapFTM2TAROT}">Buy TAROT with ETH</button> TAROT -> BALANCE: {ethers.utils.commify(parseFloat(tarotBalance).toFixed(2))}<br>
        <button on:click="{swapFTM2BIFI}">Buy TAROT with ETH</button> BIFI -> BALANCE: {ethers.utils.commify(parseFloat(bifiBalance).toFixed(2))}<br>
        <button on:click="{swapFTM2CRV}">Buy TAROT with ETH</button> CRV -> BALANCE: {ethers.utils.commify(parseFloat(crvBalance).toFixed(2))}<br>
        
        
        <button on:click="{approveLiquidityWJK}">Approve WJK</button><button on:click="{approveLiquidityUSDC}">Approve USDC</button>
        <button on:click="{makeLiquidity}">Supply Liquidity to WJK:USDC</button>
        <br>
        <button on:click="{treasuryDisableBoo}">treasury.disableBoo</button>
        <button on:click="{treasuryDisableCredit}">treasury.disableCredit</button>
        <button on:click="{treasuryDisableScream}">treasury.disableScream</button>
        <button on:click="{treasuryDisableTarot}">treasury.disableTarot</button>
    </div>
</div>
<ul class="block p-0 m-0 list-none bg-gray border w-full">
    {#each struct.contracts as s, x}
        {#if show == x}
            <li class="inline-block px-0_5 py-0_5 bg-white hover:bg-gray-light pointer" on:click="{changeTab}" x={x}>{s.name} ({typeof s.todo === "undefined" ? 0 : s.todo})</li>
        {:else}
            <li class="inline-block px-0_5 py-0_5 bg-gray hover:bg-gray-light pointer" on:click="{changeTab}" x={x}>{s.name} ({typeof s.todo === "undefined" ? 0 : s.todo})</li>
        {/if}
    {/each}
</ul>

<div class="border w-full bg-white shadow">
    {#each struct.contracts as s, x}
        {#if show == x}
            <div class="p-1">
                <a href="http://goerli.etherscan.io/address/{token.contracts[s.name].address}" target="_blank">{s.name}</a>={token.contracts[s.name].address}
                <br><br>
                {#each s.functions as f}
                    <div class="mt-1">
                        {f.name}<br>
                        {#if f.type == "input"}
                            {#each f.inputs as i}
                                {#if i.type == "const"}
                                    <input type="text" class="w-24" placeholder="{i.placeholder}" value="{i.default}" disabled="true">
                                    <button>Execute</button>
                                {:else if i.type == "should-equal-this"}
                                    <input type="text" class="w-24" placeholder="{i.placeholder}" value="{token.contracts[i.default].address}" disabled>
                                    {#if typeof token.contracts[s.name].call != "undefined"}
                                        {#if i.response == null}
                                            <button disabled>Wait</button>
                                        {:else}
                                            {#if token.contracts[i.default].address != i.response}
                                                <button on:click="{setAddress}" fname="{s.name}" address="{token.contracts[i.default].address}" command="{f.name}">Set</button>
                                            {:else}
                                                <button disabled>Equals</button>
                                            {/if}
                                        {/if}
                                    {/if}
                                {:else}
                                    <input type="text" class="w-24" placeholder="{i.placeholder}" value="{i.default}">
                                    <button>Execute</button>
                                {/if}
                            {/each}
                        {:else if f.type == "button"}
                            <button>Execute</button>
                        {/if}
                    </div>
                {/each}
            </div>
            {#each s.roles as role}
                <table class="w-full border-0 mt-1 border-spacing-0">
                    <tr><td colspan="99" class="bg-gray white p-0_5">{role.name} ({role.count})</td></tr>
                    {#each role.result as r}
                        <tr>
                            <td class="px-0_5">{r.name}</td>
                            <td class="px-0_5">{r.address}</td>
                            {#if r.response == true}
                            <td class="px-0_5"><button on:click="{revokeRole}" fname="{s.name}" address="{r.address}" keccak256="{r.keccak256}">Revoke</button></td>
                            {:else if r.response == "Updating"}
                            <td class="px-0_5"><button disabled>Wait</button></td>
                            {:else}
                            <td class="px-0_5"><button on:click="{grantRole}" fname="{s.name}" address="{r.address}" keccak256="{r.keccak256}">Grant</button></td>
                            {/if}
                            <td class="px-0_5 w-5">{r.response}</td>
                        </tr>
                    {/each}
                </table>
            {/each}
        {/if}
    {/each}
</div>

<div class="border bg-white shadow-1 rounded my-1 px-1 py-0_5">
    Treasury Control<br>
    <input type="text" bind:this="{treasuryAddStrategyToken}" placeholder="token address" autocomplete="off">
    <input type="text" bind:this="{treasuryAddStrategyStrategy}" placeholder="strategy address" autocomplete="off">
    <button on:click="{treasuryAddStrategy}">addStrategy</button><br>
    <input type="text" bind:this="{treasuryDisableStrategyToken}" placeholder="token address" autocomplete="off">
    <button on:click="{treasuryDisableStrategy}">disableStrategy</button><br>
    <input type="text" bind:this="{treasuryEnableStrategyToken}" placeholder="token address" autocomplete="off">
    <button on:click="{treasuryEnableStrategy}">enableStrategy</button><br>
    <input type="text" bind:this="{treasuryChangeStrategyToken}" placeholder="token address" autocomplete="off">
    <input type="text" bind:this="{treasuryChangeStrategyStrategy}" placeholder="strategy address" autocomplete="off">
    <button on:click="{treasuryChangeStrategy}">changeStrategy</button><br>
    <div class="mt-1">
        <input type="text" bind:this="{treasuryEnterMarketToken}" placeholder="token address" autocomplete="off">
        <button on:click="{treasuryEnterMarket}">enterMarket</button><br>
        <input type="text" bind:this="{treasuryExitAndBalanceMarketsToken}" placeholder="token address" autocomplete="off">
        <button on:click="{treasuryExitAndBalanceMarkets}">exitAndBalanceMarkets</button><br>
        <input type="text" bind:this="{treasuryExitMarketToken}" placeholder="token address" autocomplete="off">
        <button on:click="{treasuryExitMarket}">exitMarket</button><br>
    </div>
</div>
<div class="border bg-white shadow-1 rounded my-1 px-1 py-0_5">
    Token addresses
    <ul>
        <li>BOO::{token.tokens.boo.address}</li>
        <li>CREDIT::{token.tokens.credit.address}</li>
        <li>SCREAM::{token.tokens.scream.address}</li>
        <li>TAROT::{token.tokens.tarot.address}</li>
        <li>USDC::{token.tokens.usdc.address}</li>
        <li>BIFI::{token.tokens.bifi.address}</li>
        <li>CRV::{token.tokens.crv.address}</li>
    </ul>

    SoyFarm addresses
    <ul>
        <li>BOO::{token.contracts.boosoy.address}</li>
        <li>CREDIT::{token.contracts.creditsoy.address}</li>
        <li>SCREAM::{token.contracts.screamsoy.address}</li>
        <li>TAROT::{token.contracts.tarotsoy.address}</li>
        <li>USDC::{token.contracts.usdcsoy.address}</li>
        <li>BIFI::{token.contracts.bifisoy.address}</li>
        <li>CRV::{token.contracts.crvsoy.address}</li>
    </ul>
</div>
<div class="border bg-white shadow-1 rounded my-1 px-1 py-0_5">
    Locker Control<br>
    <input type="text" bind:this="{lockerAddStrategyToken}" placeholder="token address" autocomplete="off">
    <input type="text" bind:this="{lockerAddStrategyStrategy}" placeholder="strategy address" autocomplete="off">
    <button on:click="{lockerAddStrategy}">addStrategy</button><br>
    <input type="text" bind:this="{lockerDisableStrategyToken}" placeholder="token address" autocomplete="off">
    <button on:click="{lockerDisableStrategy}">disableStrategy</button><br>
    <input type="text" bind:this="{lockerEnableStrategyToken}" placeholder="token address" autocomplete="off">
    <button on:click="{lockerEnableStrategy}">enableStrategy</button><br>
    <input type="text" bind:this="{lockerChangeStrategyToken}" placeholder="token address" autocomplete="off">
    <input type="text" bind:this="{lockerChangeStrategyStrategy}" placeholder="strategy address" autocomplete="off">
    <button on:click="{lockerChangeStrategy}">changeStrategy</button><br>
</div>

{/if}