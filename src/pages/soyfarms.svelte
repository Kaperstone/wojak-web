<script>
import { getNotificationsContext } from "svelte-notifications"
const { addNotification } = getNotificationsContext()

export let account
export let token
export let signer
// export let provider
export let connected
// export let nonce

const unlimited = "0xffffffffffffffffffffffffffffffffffffffffffffffffff"
let farms = []

if(connected) getBasic()
window.dispatch = () => getBasic()

function getBasic() {
    if(typeof token.contracts !== "undefined") {
        let i = 0, collector = [], farmId = 0
        const mantissa = Math.pow(10, 18) // 1 * 10 ^ 18
        const blocksPerYear = 2102400
        const blocksPerDay = (60/token.chain.blockTime)*60*24
        const wojak = new ethers.Contract(token.contracts.token.address, token.contracts.token.abi, signer)
        const zoomer = new ethers.Contract(token.contracts.zoomer.address, token.contracts.zoomer.abi, signer)

        for(let x in token.contracts) {
            if(token.contracts[x].farm && !token.contracts[x].disabled) {
                
                const ib = new ethers.Contract(token.contracts[x].ib, [
                    "function supplyRatePerBlock() public view returns (uint256)",
                    "function exchangeRateCurrent() public view returns (uint256)",
                    "function balanceOf(address) public view returns (uint256)",
                    "function symbol() public view returns (string memory)",
                    "function totalSupply() public view returns (uint256)",
                    "function underlyingBalanceForAccount(address) public view returns (uint)",
                    "function balanceOfUnderlying(address) public view returns (uint)",
                    "function BOOBalance(address) public view returns (uint)",
                    "function decimals() public view returns (uint)"
                ], signer)
                const usdc = new ethers.Contract(token.contracts[x].usdc, token.tokens.usdc.abi, signer)
                const soy = new ethers.Contract(token.contracts[x].address, token.contracts[x].abi, signer)

                if(token.contracts[x].token == "usdc") {
                    collector[i++] = ib.supplyRatePerBlock()
                }
                collector[i++] = usdc.decimals()
                collector[i++] = ib.decimals()
                collector[i++] = usdc.balanceOf(account.address)
                collector[i++] = soy.balanceOf(account.address)
                collector[i++] = soy.checkRewards(account.address)
                collector[i++] = usdc.allowance(account.address, token.contracts[x].address)
                collector[i++] = soy.allowance(account.address, token.contracts[x].address)
                collector[i++] = soy.timeDifference(account.address)
                if(token.contracts[x].token == "tarot") {
                    collector[i++] = ib.underlyingBalanceForAccount(token.contracts[x].address)
                }else if(token.contracts[x].token == "usdc" || token.contracts[x].token == "bifi" || token.contracts[x].token == "crv") {
                    collector[i++] = ib.balanceOfUnderlying(token.contracts[x].address)
                }else if(token.contracts[x].token == "boo") {
                    collector[i++] = ib.BOOBalance(token.contracts[x].address)
                }else{
                    collector[i++] = ib.balanceOf(token.contracts[x].address)
                }
                collector[i++] = soy.epochIndex()

                collector[i++] = ib.symbol()
                collector[i++] = usdc.balanceOf(token.contracts[x].ib)
                collector[i++] = ib.totalSupply()
                collector[i++] = zoomer.balanceOf(token.contracts[x].address)
            }
        }
        
        Promise.all(collector).then(async values => {
            i = 0
            for(let x in token.contracts) {
                if(token.contracts[x].farm && !token.contracts[x].disabled) {
                    if(token.contracts[x].token == "usdc") {
                        token.contracts[x].interest = (((Math.pow((values[i++] / mantissa * blocksPerDay) + 1, 365 - 1))) - 1) * 100;
                    }else{
                        token.contracts[x].interest = 0
                    }
                    token.contracts[x].wjkInterest = getMultiplier(token.contracts[x].interest)

                    let idecimals = parseInt(values[i++])
                    let ldecimals = parseInt(values[i++])
                    token.contracts[x].decimals = idecimals
                    const usdcBalance = values[i++];
                    token.contracts[x].usdc_balance = ethers.utils.formatUnits(usdcBalance, idecimals)
                    token.contracts[x].soy_balance = ethers.utils.formatUnits(values[i++], idecimals)
                    token.contracts[x].rewards = ethers.utils.formatEther(await zoomer.balanceOfUnderlying(values[i++]))
                    
                    token.contracts[x].usdc_allowance = values[i++]
                    token.contracts[x].soy_allowance = values[i++]
                    
                    token.contracts[x].timeDifference = values[i++]
                    token.contracts[x].ctoken_balance = ethers.utils.formatUnits(values[i++], idecimals)
                    token.contracts[x].epochIndex = values[i++]
                    token.contracts[x].symbol = values[i++]
                    const isupply = parseFloat(ethers.utils.formatUnits(values[i++], idecimals))
                    const xsupply = parseFloat(ethers.utils.formatUnits(values[i++], ldecimals))

                    token.contracts[x].index = 0
                    if(isupply > 0 && xsupply > 0) token.contracts[x].index = isupply / xsupply
                    

                    token.contracts[x].rewardBalance = ethers.utils.formatEther(await zoomer.balanceOfUnderlying(values[i++]))

                    farms[farmId++] = token.contracts[x]
                }
            }
        })

    }
}
// console.log("Multiplier=")
// console.log((getMultiplier(35) * 100).toFixed(2) + "%")
function getMultiplier(percent) {
    let interest = (percent / 100)
    let end_wojak = 0
    let wojakTotal = 0
    let earnPerDay = (interest / 365)
    earnPerDay -= earnPerDay * 0.1
    
    for(let x = 0; x < 365; x++) {
        end_wojak += earnPerDay + (wojakTotal * 0.005)
        wojakTotal += earnPerDay
    }

    return end_wojak;
}

let depositAmount = []
async function deposit() {
    if(!account.connected) return processError({message:"Wallet is not connected"}, true)
    const farm = this.getAttribute("farm")
    if(token.contracts[farm].usdc_allowance.eq("0")) return processError({message:"You must approve first"}, true)

    const id = parseInt(this.id)
    const decimals = token.tokens[token.contracts[farm].token].decimals
    const amount = depositAmount[id].value
    if(amount.length == 0) return processError({message:"You must enter value to deposit"}, true)

    const soy = new ethers.Contract(token.contracts[farm].address, token.contracts[farm].abi, signer)

    try {
        const tx = await soy.deposit(ethers.utils.parseUnits(amount, decimals))
        notify("Transaction processing", "warning")
        await tx.wait()
        notify("Transaction successful", "success")
    } catch (error) {processError(error)}
}

async function maxDeposit() {
    const i = parseInt(this.id)
    depositAmount[i].value = farms[i].usdc_balance
}

let withdrawAmount = []
async function withdraw() {
    if(!account.connected) return processError({message:"Wallet is not connected"}, true)
    const farm = this.getAttribute("farm")
    if(token.contracts[farm].soy_allowance.eq("0")) return processError({message:"You must approve first"}, true)

    const id = parseInt(this.id)
    const decimals = token.tokens[token.contracts[farm].token].decimals
    const amount = withdrawAmount[id].value
    if(amount.length == 0) return processError({message:"You must enter value to withdraw"}, true)

    const soy = new ethers.Contract(token.contracts[farm].address, token.contracts[farm].abi, signer)

    try {        
        const tx = await soy.withdraw(ethers.utils.parseUnits(amount, decimals))
        notify("Transaction processing", "warning")
        await tx.wait()
        notify("Transaction successful", "success")
    } catch (error) {processError(error)}
}

async function maxWithdraw() {
    const i = parseInt(this.id)
    withdrawAmount[i].value = farms[i].soy_balance
}

let approvein, approveout
async function approve() {
    if(!account.connected) return processError({message:"Wallet is not connected"}, true)

    const type = this.getAttribute("type")
    const direction = this.getAttribute("direction")
    const farm = this.getAttribute("farm")

    const decimals = token.tokens[token.contracts[farm].token].decimals

    const usdc = new ethers.Contract(token.contracts[farm].usdc, token.tokens.usdc.abi, signer)
    const soy = new ethers.Contract(token.contracts[farm].address, token.contracts[farm].abi, signer)
    try {
        let tx, amount

        if(type == "all") {
            amount = "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"

        }else{
            const amount = approveout.value
            if(amount.length == 0) return processError({message:"You must enter value to approve"}, true)

            amount = ethers.utils.parseUnits(amount, decimals)
        }
        
        tx = await (direction == "in"?usdc:soy).approve(token.contracts[farm].address, amount)
        notify("Transaction processing", "warning")
        await tx.wait()
        notify("Transaction successful", "success")
    } catch (error) {processError(error)}
}

async function withdrawRewards() {
    const farm = this.getAttribute("farm")
    try {
        const soy = new ethers.Contract(token.contracts[farm].address, token.contracts[farm].abi, signer)
        const tx = await soy.withdrawRewards()
        notify("Transaction processing", "warning")
        await tx.wait()
        notify("Transaction successful", "success")
    } catch(error) {}
}

function notify(text, type) {
    addNotification({
        text,
        position: "bottom-left",
        type,
        removeAfter: 4000
    })
}

function processError(error) {
    if(typeof error === "object") {
        addNotification({
            text: error.message,
            position: "bottom-left",
            type: "danger",
            removeAfter: 4000
        })
    }else{
        let json = JSON.parse(error.message.toString().split("error=")[1].split(", method=")[0])
        addNotification({
            text: json.message,
            position: "bottom-left",
            type: "danger",
            removeAfter: 4000
        })
    }
    console.log(error.message)
}

function format(number) {
    if(typeof number === "undefined" || isNaN(number)) return 0;
    return ethers.utils.commify(parseFloat(number).toFixed(2))
}
</script>
<h1>Soy farms (4, 4)</h1>
Make about ~52.356% more from your crypto!<br>
In order to participate you must lock your tokens for 7 days, in order to 
keep fairness and the math correct you will not receive rewards from your 
first round, thus its recommended to enter right before the next epoch begins.<br>
Your first round rewards will be distributed among the farmers that are already in.<br>
<br>
Tax is as below
<ul>
    <li>5% on profits made in each epoch</li>
    <li>1% to devs to pay for gas, system expenses and etc.</li>
</ul>
<br>
{#if !connected}
    <div style="background:#eee;padding:1rem;border:1px solid #aaa;border-radius:.5rem">
        Connect wallet first or change to a supported blockchain,<br>the website uses wallet connection to connect to the blockchain
    </div>
{:else}
    <table class="w-full bg-white shadow-1 mt-1 border">
        {#each farms as t, i}
        {#if !t.disabled}
        <tr>
            <td class="w-full">
                <input class="toggle-reveal" type="checkbox" id="{t.ib.toLowerCase()}_cb" style="display:none">
                <table class="{t.token.toLowerCase()}-farm w-full border-solid border-1 pgray">
                    <label for="{t.ib.toLowerCase()}_cb">
                        <tr>
                            <td class="px-1 w-1 center"><img class="icon" src="{t.image}" alt="{t.name}" /></td>
                            <td class="w-full py-0_5">
                                <span class="darken">Deposit</span> {t.token.toUpperCase()} <span class="darken">earn</span> WJK
                                {#if t.disabled}
                                <span class="disabled">deprecated</span>
                                {/if}
                                <br>
                                <span class="darken smaller">{t.platform}</span>
                            </td>

                            {#if t.interest == 0}
                                <td class="px-0_5 w-8 left">X+52.356%</td>
                            {:else}
                                {#if t.interest < 0.1}
                                <td class="px-0_5 w-8 left">{t.interest.toFixed(3)}% > {(t.wjkInterest * 100).toFixed(3)}%</td>
                                {:else}
                                <td class="px-0_5 w-8 left">{t.interest.toFixed(2)}% > {(t.wjkInterest * 100).toFixed(2)}%</td>
                                {/if}
                            {/if}

                            <td class="px-0_5 w-5 left">{format(t.soy_balance)}<br>Deposited</td>

                            {#if t.token == "scream" || t.token == "credit"}
                            <td class="px-0_5 w-5 right">{format(t.ctoken_balance * t.index)}<br><span class="uppercase">{t.token}</span></td>
                            {:else}                        
                                <td class="px-0_5 w-5 right">{format(t.ctoken_balance)}<br><span class="uppercase">{t.token}</span></td>
                            {/if}
                        </tr>
                    </label>
                    <tr class="window-reveal">
                        <td colspan="99">
                            <div>
                                <table class="w-full border-0">
                                    <tr>
                                        <td class="p-1">
                                            <div class="bold mt-1">Approve <span class="uppercase">{t.token}</span></div>
                                            <input bind:this="{approvein}" type="text" class="w-full my-0_5" placeholder="Allowance: {t.usdc_allowance.gt(unlimited) ? "Unlimited" : ethers.utils.commify(ethers.utils.formatUnits(t.usdc_allowance, t.decimals))}">
                                            <button on:click="{approve}" farm="{t.name}" direction="in" type="amount">Approve</button>
                                            <button on:click="{approve}" farm="{t.name}" direction="in" type="all">Approve Unlimited</button>
                                        </td>
                                        <td class="p-1">
                                            <div class="bold mt-1">Approve {t.token}SOY</div>
                                            <input bind:this="{approveout}" type="text" class="w-full my-0_5" placeholder="Allowance: {t.soy_allowance.gt(unlimited) ? "Unlimited" : ethers.utils.commify(ethers.utils.formatUnits(t.soy_allowance, t.decimals))}">
                                            <button on:click="{approve}" farm="{t.name}" direction="out" type="amount">Approve</button>
                                            <button on:click="{approve}" farm="{t.name}" direction="out" type="all">Approve Unlimited</button>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td class="relative p-1">
                                            {#if !t.usdc_allowance.gt("1")}
                                                <div class="absolute l-0 t-0 w-full h-full half-transparent"></div>
                                            {/if}
                                            <div class="bold mt-1">Deposit <span class="uppercase">{t.token}</span></div>
                                            Balance: {format(t.usdc_balance)} (<span class="cblue hover:underline pointer" on:click="{maxDeposit}" id="{i}">MAX</span>)<br>
                                            <input class="w-full my-0_5" type="text" bind:this="{depositAmount[i]}" placeholder="Amount">
                                            <button on:click="{deposit}" farm="{t.name}" id="{i}">Deposit</button>
                                            <br>Warning: Everytime you deposit or withdraw, the epoch resets.
                                        </td>
                                        <td class="relative p-1">
                                            {#if !t.soy_allowance.gt("1")}
                                                <div class="absolute l-0 t-0 w-full h-full half-transparent"></div>
                                            {/if}
                                            <div class="bold mt-1">Withdraw {t.token}SOY</div>
                                            Balance: {format(t.soy_balance)} (<span class="cblue hover:underline pointer" on:click="{maxWithdraw}" id="{i}">MAX</span>)<br>
                                            <input class="w-full my-0_5" type="text" bind:this="{withdrawAmount[i]}" placeholder="Amount">
                                            <button on:click="{withdraw}" farm="{t.name}" id="{i}">Withdraw</button>
                                            <br>Warning: Everytime you deposit or withdraw, the epoch resets.
                                        </td>
                                    </tr>
                                    <tr>
                                        <td class="center" colspan="2">
                                            <div>
                                                {#if t.rewards == 0}
                                                    <button disabled>Withdraw Rewards</button>
                                                {:else}
                                                    <button on:click="{withdrawRewards}" farm="{t.name}">Withdraw Rewards</button><br>
                                                {/if}
                                            </div>
                                            <table class="my-1 shadow border-1 rounded mx-auto">
                                                <tr>
                                                    <td class="px-1 py-0_5">Rewards: {t.rewards}</td>
                                                    <td class="px-1 py-0_5">Epoch index: {t.epochIndex}</td>
                                                    <td class="px-1 py-0_5">Your epoch: {t.timeDifference}/7</td>
                                                </tr>
                                            </table>
                                            <div class="center">
                                                {format(t.rewardBalance)} WJK
                                            </div>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td class="center" colspan="2">
                                            Contract: <a href="https://goerli.etherscan.io/address/{t.address}" target="_blank">{t.address}</a> (source)
                                        </td>
                                    </tr>
                                </table>
                            </div>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
        {/if}
        {/each}
    </table>
{/if}