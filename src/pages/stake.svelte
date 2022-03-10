<script>
import { getNotificationsContext } from "svelte-notifications"
const { addNotification } = getNotificationsContext();

export let account
export let token
export let signer
export let provider
export let connected
export let wojak
export let stake
export let stakelocker
export let nonce

let pair, usdc

const unlimited = "0xffffffffffffffffffffffffffffffffffffffffffffffffff"
let 
    totalStaked = ethers.utils.parseEther("0"),
    wjkSupply = ethers.utils.parseEther("0"),
    boomerSupply = ethers.utils.parseEther("0"),
    index = "0", price = "0", myRewards = 0, 
    usdcLocked = 0, totalLocked = 0, timeDifference = 0, myLocked = 0, myStaked = 0,
    wjkAllowance = ethers.utils.parseEther("0"),
    swjkAllowance = ethers.utils.parseEther("0"),
    swjkAllowance2 = ethers.utils.parseEther("0"),
    lockAllowance = ethers.utils.parseEther("0"),
    exit = 0.0, epochIndex = -1,
    booRewards = 0,
    creditRewards = 0,
    screamRewards = 0,
    tarotRewards = 0,
    usdcRewards = 0,
    bifiRewards = 0,
    crvRewards = 0,
    dataPrice = {},
    stakedValue = 0, lockedValue = 0, rewardValue = 0

window.dispatch = () => getAccount()
if(connected) getAccount()

function getAccount() {
    if(typeof token.contracts !== "undefined") {
        pair = new ethers.Contract(token.swap.pair.address, token.swap.pair.abi, signer)
        usdc = new ethers.Contract(token.tokens.usdc.address, token.tokens.usdc.abi, provider)

        const usdcftmpair = new ethers.Contract(token.swap.usdcftmpair.address, token.swap.usdcftmpair.abi, provider)
        const booftmpair = new ethers.Contract(token.swap.booftmpair.address, token.swap.booftmpair.abi, provider)
        const creditftmpair = new ethers.Contract(token.swap.creditftmpair.address, token.swap.creditftmpair.abi, provider)
        const screamftmpair = new ethers.Contract(token.swap.screamftmpair.address, token.swap.screamftmpair.abi, provider)
        const tarotftmpair = new ethers.Contract(token.swap.tarotftmpair.address, token.swap.tarotftmpair.abi, provider)
        const bififtmpair = new ethers.Contract(token.swap.bififtmpair.address, token.swap.bififtmpair.abi, provider)
        const crvftmpair = new ethers.Contract(token.swap.crvftmpair.address, token.swap.crvftmpair.abi, provider)


        let collector = []

        collector[0] = wojak.balanceOf(token.contracts.stake.address);
        collector[1] = wojak.totalSupply();
        collector[2] = stake.totalSupply();
        collector[8] = stakelocker.totalSupply()

        if(account.connected) {
            collector[3] = pair.getReserves()
            collector[4] = stake.index()
            collector[5] = wojak.allowance(account.address, token.contracts.stake.address)
            collector[6] = stake.allowance(account.address, token.contracts.stake.address)
            // collector[9] = stakelocker.checkRewards(account.address)
            collector[10] = stakelocker.timeDifference(account.address)
            collector[11] = stakelocker.balanceOf(account.address)
            collector[12] = stake.balanceOf(account.address)
            collector[13] = stakelocker.allowance(account.address, token.contracts.stakelocker.address)
            collector[14] = stake.allowance(account.address, token.contracts.stakelocker.address)
            collector[15] = stake.balanceOfUnderlying(account.staked)
            collector[16] = stakelocker.epochIndex()

            collector[17] = stakelocker.checkRewards(account.address, token.tokens.boo.address)
            collector[18] = stakelocker.checkRewards(account.address, token.tokens.credit.address)
            collector[19] = stakelocker.checkRewards(account.address, token.tokens.scream.address)
            collector[20] = stakelocker.checkRewards(account.address, token.tokens.tarot.address)
            collector[21] = stakelocker.checkRewards(account.address, token.tokens.usdc.address)
            collector[22] = stakelocker.checkRewards(account.address, token.tokens.bifi.address)
            collector[23] = stakelocker.checkRewards(account.address, token.tokens.crv.address)

            collector[24] = usdcftmpair.getReserves()
            collector[25] = booftmpair.getReserves()
            collector[26] = creditftmpair.getReserves()
            collector[27] = screamftmpair.getReserves()
            collector[28] = tarotftmpair.getReserves()
            collector[29] = bififtmpair.getReserves()
            collector[30] = crvftmpair.getReserves()
        }

        Promise.all(collector).then(values => {
            totalStaked = values[0]
            wjkSupply = values[1]
            boomerSupply = values[2]
            totalLocked = parseFloat(ethers.utils.formatEther(values[8]))
            
            if(account.connected) {
                const
                    res0 = parseFloat(ethers.utils.formatUnits(values[3][0], token.tokens.usdc.decimals)),
                    res1 = parseFloat(ethers.utils.formatUnits(values[3][1]))
                price = res0 / res1

                index = parseFloat(ethers.utils.formatEther(values[4]))
                wjkAllowance = values[5]
                swjkAllowance = values[6]
                // myRewards = values[9]
                timeDifference = parseInt(values[10]) + 2628000
                myLocked = parseFloat(ethers.utils.formatEther(values[11]))
                myStaked = parseFloat(ethers.utils.formatEther(values[12]))
                lockAllowance = values[13]
                swjkAllowance2 = values[14]
                
                exit = parseFloat(ethers.utils.formatEther(values[15]))
                epochIndex = parseInt(values[16])

                booRewards = parseFloat(ethers.utils.formatEther(values[17]))
                creditRewards = parseFloat(ethers.utils.formatEther(values[18]))
                screamRewards = parseFloat(ethers.utils.formatEther(values[19]))
                tarotRewards = parseFloat(ethers.utils.formatEther(values[20]))
                usdcRewards = parseFloat(ethers.utils.formatUnits(values[21], 6))
                bifiRewards = parseFloat(ethers.utils.formatEther(values[22]))
                crvRewards = parseFloat(ethers.utils.formatEther(values[23]))
            }
            
            {
                const
                    res0 = parseFloat(ethers.utils.formatUnits(values[24][0], token.tokens.usdc.decimals)),
                    res1 = parseFloat(ethers.utils.formatUnits(values[24][1]))
                dataPrice.ftm = res0 / res1
            }
            {
                const
                    res0 = parseFloat(ethers.utils.formatUnits(values[25][0])),
                    res1 = parseFloat(ethers.utils.formatUnits(values[25][1]))
                dataPrice.boo = res0 / res1
            }
            {
                const
                    res0 = parseFloat(ethers.utils.formatUnits(values[26][0])),
                    res1 = parseFloat(ethers.utils.formatUnits(values[26][1]))
                dataPrice.credit = res0 / res1
            }
            {
                const
                    res0 = parseFloat(ethers.utils.formatUnits(values[27][0])),
                    res1 = parseFloat(ethers.utils.formatUnits(values[27][1]))
                dataPrice.scream = res0 / res1
            }
            {
                const
                    res0 = parseFloat(ethers.utils.formatUnits(values[28][0])),
                    res1 = parseFloat(ethers.utils.formatUnits(values[28][1]))
                dataPrice.tarot = res0 / res1
            }
            {
                const
                    res0 = parseFloat(ethers.utils.formatUnits(values[29][0])),
                    res1 = parseFloat(ethers.utils.formatUnits(values[29][1]))
                dataPrice.bifi = res0 / res1
            }
            {
                const
                    res0 = parseFloat(ethers.utils.formatUnits(values[30][0])),
                    res1 = parseFloat(ethers.utils.formatUnits(values[30][1]))
                dataPrice.crv = res1 / res0
            }

            stakedValue = parseFloat(ethers.utils.formatEther(totalStaked)) * price
            lockedValue = parseFloat(totalLocked) * price
            rewardValue = booRewards * dataPrice.boo +creditRewards * dataPrice.credit +screamRewards * dataPrice.scream +tarotRewards * dataPrice.tarot +bifiRewards * dataPrice.bifi +crvRewards * dataPrice.crv
        })
    }
}

let stakeIn, stakeOut,
    approveIn, approveOut

async function approveWJK() {
    if(!connected) return processError({message:"Wallet is not connected"}, true)
    if(approveIn.value.length == 0) return alert("Value cannot be empty")

    try {
        const tx = await wojak.approve(token.contracts.stake.address, ethers.utils.parseUnits(approveIn.value, 18))
        notify("Transaction processing", "warning")
        await tx.wait()
        notify("Transaction successful", "success")
    } catch (error) {processError(error)}
}

async function approveWJKUnlimited() {
    if(!connected) return processError({message:"Wallet is not connected"}, true)

    try {
        const tx = await wojak.approve(token.contracts.stake.address, "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff")
        notify("Transaction processing", "warning")
        await tx.wait()
        notify("Transaction successful", "success")
    } catch (error) {processError(error)}
}


async function Stake() {
    if(!connected) return processError({message:"Wallet is not connected"}, true)
    if(stakeIn.value.length == 0) return notify("Value cannot be empty", "danger")

    try {
        const tx = await stake.stake(ethers.utils.parseUnits(stakeIn.value, 18))
        notify("Transaction processing", "warning")
        await tx.wait()
        notify("Transaction successful", "success")
    } catch (error) {processError(error)}
}

async function stakeAll() {
    if(!connected) return processError({message:"Wallet is not connected"}, true)

    try {
        const wjkBalance = await wojak.balanceOf(account.address)
        const tx = await stake.stake(wjkBalance)
        notify("Transaction processing", "warning")
        await tx.wait()
        notify("Transaction successful", "success")
    } catch (error) {processError(error)}
}
async function approveBOOMER() {
    if(!connected) return processError({message:"Wallet is not connected"}, true)
    if(approveOut.value.length == 0) return alert("Value cannot be empty")

    try {
        const tx = await stake.approve(token.contracts.stake.address, ethers.utils.parseUnits(approveOut.value, 18))
        notify("Transaction processing", "warning")
        await tx.wait()
        notify("Transaction successful", "success")
    } catch (error) {processError(error)}
}

async function approveBOOMERUnlimited() {
    if(!connected) return processError({message:"Wallet is not connected"}, true)

    try {
        const tx = await stake.approve(token.contracts.stake.address, "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff")
        notify("Transaction processing", "warning")
        await tx.wait()
        notify("Transaction successful", "success")
    } catch (error) {processError(error)}
}

async function unstake() {
    if(!connected) return processError({message:"Wallet is not connected"}, true)
    if(stakeOut.value.length == 0) return alert("Value cannot be empty")

    try {
        const tx = await stake.unstake(ethers.utils.parseEther(stakeOut.value, 18))
        notify("Transaction processing", "warning")
        await tx.wait()
        notify("Transaction successful", "success")
    } catch (error) {processError(error)}
}

async function unstakeAll() {
    if(!connected) return processError({message:"Wallet is not connected"}, true)

    try {
        const swjkBalance = await stake.balanceOf(account.address)
        const tx = await stake.unstake(swjkBalance)
        notify("Transaction processing", "warning")
        await tx.wait()
        notify("Transaction successful", "success")
    } catch (error) {processError(error)}
}

///////////////////////////////////
//////////////////////////// LOCKER
///////////////////////////////////

let inputLockerIn, inputLockerOut,
    inputLockerApproveIn, inputLockerApproveOut

async function approveInLocker() {
    if(!connected) return processError({message:"Wallet is not connected"}, true)
    if(inputLockerApproveIn.value.length == 0) return alert("Value cannot be empty")

    try {
        notify("Transaction processing", "warning")
        const tx = await stake.approve(token.contracts.stakelocker.address, ethers.utils.parseUnits(inputLockerApproveIn.value, 18))
        await tx.wait()
        notify("Transaction successful", "success")
    } catch (error) {processError(error)}
}

async function approveInUnlimitedLocker() {
    if(!connected) return processError({message:"Wallet is not connected"}, true)

    try {
        notify("Transaction processing", "warning")
        const tx = await stake.approve(token.contracts.stakelocker.address, "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff")
        await tx.wait()
        notify("Transaction successful", "success")
    } catch (error) {processError(error)}
}


async function depositLocker() {
    if(!connected) return processError({message:"Wallet is not connected"}, true)
    if(inputLockerIn.value.length == 0) return notify("Value cannot be empty", "danger")

    try {
        notify("Transaction processing", "warning")
        const tx = await stakelocker.enter(ethers.utils.parseUnits(inputLockerIn.value, 18))
        await tx.wait()
        notify("Transaction successful", "success")
    } catch (error) {processError(error)}
}

async function depositAllLocker() {
    if(!connected) return processError({message:"Wallet is not connected"}, true)

    try {
        notify("Transaction processing", "warning")
        const wjkBalance = await stake.balanceOf(account.address)
        const tx = await stakelocker.enter(wjkBalance)
        await tx.wait()
        notify("Transaction successful", "success")
    } catch (error) {processError(error)}
}

///////// Out

async function approveOutLocker() {
    if(!connected) return processError({message:"Wallet is not connected"}, true)
    if(inputLockerApproveOut.value.length == 0) return alert("Value cannot be empty")

    try {
        notify("Transaction processing", "warning")
        const tx = await stakelocker.approve(token.contracts.stakelocker.address, ethers.utils.parseUnits(inputLockerApproveOut.value, 18))
        await tx.wait()
        notify("Transaction successful", "success")
    } catch (error) {processError(error)}
}

async function approveOutUnlimitedLocker() {
    if(!connected) return processError({message:"Wallet is not connected"}, true)

    try {
        notify("Transaction processing", "warning")
        const tx = await stakelocker.approve(token.contracts.stakelocker.address, "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff")
        await tx.wait()
        notify("Transaction successful", "success")
    } catch (error) {processError(error)}
}

async function withdrawLocker() {
    if(!connected) return processError({message:"Wallet is not connected"}, true)
    if(inputLockerOut.value.length == 0) return alert("Value cannot be empty")

    try {
        notify("Transaction processing", "warning")
        const tx = await stakelocker.leave(ethers.utils.parseEther(inputLockerOut.value, 18))
        await tx.wait()
        notify("Transaction successful", "success")
    } catch (error) {processError(error)}
}

async function withdrawAllLocker() {
    if(!connected) return processError({message:"Wallet is not connected"}, true)

    try {
        notify("Transaction processing", "warning")
        const swjkBalance = await stakelocker.balanceOf(account.address)
        const tx = await stakelocker.leave(swjkBalance)
        notify("Transaction waiting confirmation", "warning")
        await tx.wait()
        notify("Transaction successful", "success")
    } catch (error) {processError(error)}
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
        let json = JSON.parse(error.toString().split("error=")[1].split(", method=")[0])
        addNotification({
            text: json.message,
            position: "bottom-left",
            type: "danger",
            removeAfter: 4000
        })
    }
    console.log(error)
}

function maxLockerIn() {
    inputLockerIn.value = this.getAttribute("balance")
}

function maxLockerOut() {
    inputLockerOut.value = this.getAttribute("balance")
}

function calcEarning(days) {
    return parseFloat(ethers.utils.formatEther(account.staked)) * index * Math.pow(1.0025, days)
}

function format(number) {
    if(typeof number === "undefined" || isNaN(number)) return 0;
    return ethers.utils.commify(parseFloat(number).toFixed(2))
}

function getTimeRemaining(endtime) {
	if(Math.round(new Date() / 1000) < endtime) {
		const total = endtime - Math.round(new Date() / 1000);
		return "" + Math.floor( (total/3600) % 24 ) + "hr " + Math.floor( (total/60) % 60 ) + "min " + Math.floor( total % 60 ) + "sec"
	}else{
		return "0hr 0min 0sec"
	}
}
</script>
<h1>Boomer stake (2, 2)</h1>
{#if typeof token.contracts !== "undefined"}
    Contract: <a href="https://goerli.etherscan.io/address/{token.contracts.stake.address}" target="_blank">{token.contracts.stake.address}</a> (source)<br><br>
{/if}
<br>
<table class="border center p-1 rounded shadow-1 bg-white w-full">
    <tr>
        <td class="pt-0_5 pb-1" colspan="99">
            Earn fixed & predictable staking rewards and then lock for 30 days to get a share of the protocol's revenue
        </td>
    </tr>
    <tr>
        <td class="py-0_5">{(100 * Math.pow(1 + (0.25 / 100), 365) - 100).toFixed(3)}%<br>Fixed APY</td>
        <td class="py-0_5">0.25%<br>per day</td>
    </tr>
</table>
<br>
{#if !account.connected}
    <div style="background:#eee;padding:1rem;border:1px solid #aaa;border-radius:.5rem;margin-top:1rem">
        Connect wallet first or change to a supported blockchain,<br>the website uses wallet connection to connect to the blockchain
    </div>
{:else if pair != null}
    <div class="relative border rounded border-solid">
        <table class="w-full shadow rounded bg-white">
            <tr>
            {#if wjkAllowance.eq("0")}
                <td class="border p-0_5 align-top rounded-l-t rounded-r-t" colspan="4">
                    In order to stake the amount you want, you need first allow the contract to transfer that amount to itself on your behalf.
                    <br>
                    <br>
                    Simple as that :: Not enough allowance (approved) = not able to stake that amount<br>
                    <span style="font-size:smaller">Disclaimer: it is never recommended to use `unlimited` on projects you don't trust. Be warned.</span>
                </td>
            {:else}
                <td class="border p-0_5 align-top rounded-l-t rounded-r-t" colspan="4">
                    <table class="w-full center" style="border:0">
                        <tr>
                            <td class="py-1" colspan="3">
                                Staked<br>
                                <b class="large">{format(exit)}</b> $WJK
                                <br>
                                ({format(((ethers.utils.formatEther(account.staked))) * index * price)}$)
                            </td>
                        </tr>
                        <tr>
                            <td class="green border-transparent w-third py-1">
                                <b class="normal">{format(calcEarning(1))} $WJK</b><br>
                                <span class="small">({format(calcEarning(1) * price)}$)</span>
                                <br>In a Day
                            </td>

                            <td class="blue border-transparent w-third py-1">
                                <b class="normal">{format(calcEarning(30))} $WJK</b><br>
                                <span class="small">({format(calcEarning(30) * price)}$)</span>
                                <br>In a Month
                            </td>

                            <td class="red border-transparent w-third py-1">
                                <b class="normal">{format(calcEarning(365))} $WJK</b><br>
                                <span class="small">({format(calcEarning(365) * price)}$)</span>
                                <br>In a Year
                            </td>
                        </tr>
                    </table>
                </td>
            {/if}
            </tr>
            <tr>
                <td class="blue border relative p-0_5 align-top border-b-dashed" colspan="2">
                    Approve $WJK<br>
                    <input class="my-0_5 w-full" type="text" bind:this="{approveIn}" placeholder="Allowance: {wjkAllowance.gt(unlimited) ? "Unlimited" : ethers.utils.commify(ethers.utils.formatEther(wjkAllowance))}"><br>
                    <button on:click="{approveWJK}">Approve</button>
                    <button on:click="{approveWJKUnlimited}">Approve Unlimited</button>
                </td>
                <td class="pink border relative p-0_5 align-top border-b-dashed" colspan="2">
                    Approve $BOOMER<br>
                    <input class="my-0_5 w-full" type="text" bind:this="{approveOut}" placeholder="Allowance: {swjkAllowance.gt(unlimited) ? "Unlimited" : ethers.utils.commify(ethers.utils.formatEther(swjkAllowance))}"><br>
                    <button on:click="{approveBOOMER}">Approve</button>
                    <button on:click="{approveBOOMERUnlimited}">Approve Unlimited</button>
                </td>
            </tr>
            <tr>
                <td class="green border relative p-0_5 align-top border-t-dashed" colspan="2">
                    {#if !wjkAllowance.gt("1")}
                    <div class="absolute l-0 t-0 w-full h-full half-transparent"></div>
                    {/if}
                    Stake (2% burn tax on staking)<br>
                    Balance: {format(ethers.utils.formatEther(account.balance))}<br>
                    <input class="my-0_5 w-full" type="text" bind:this="{stakeIn}" placeholder="Amount"><br>
                    <button on:click="{Stake}">Stake Amount</button>
                    <button on:click="{stakeAll}">Stake All</button>
                </td>
                <td class="red border relative p-0_5 align-top border-t-dashed" colspan="2">
                    {#if !swjkAllowance.gt("1")}
                        <div class="absolute l-0 t-0 w-full h-full half-transparent"></div>
                    {/if}
                    Unstake<br>
                    Balance: {format(ethers.utils.formatEther(account.staked))}<br>
                    <input class="my-0_5 w-full" type="text" bind:this="{stakeOut}" placeholder="Amount"><br>
                    <button on:click="{unstake}">Unstake Amount</button>
                    <button on:click="{unstakeAll}">Unstake All</button>
                </td>
            </tr>
            <tr>
                {#if !wjkSupply.eq("0") && !totalStaked.eq("0") && price > 0}
                    <td class="border rounded-l-b center p-1 w-quarter">
                        Total Staked<br>
                        {format(ethers.utils.formatEther(totalStaked))} $WJK
                    </td>
                    <td class="border center p-1 w-quarter">
                        Staked Value<br>
                        {format(stakedValue)}$
                    </td>
                    <td class="border center p-1 w-quarter">
                        Percentage staked<br>
                        {(100 / parseFloat(wjkSupply.div(totalStaked))).toFixed(2)}%        
                    </td>
                    <td class="border rounded-r-b center p-1 w-quarter">
                        Index<br>{parseFloat(index).toFixed(2)}
                    </td>
                {:else}
                    <td class="border rounded-l-b center p-1 w-quarter">
                        Total Staked<br>
                        0.0 $WJK (0.0%)
                    </td>
                    <td class="border center p-1 w-quarter">
                        Staked Value<br>
                        0.0$
                    </td>
                    <td class="border center p-1 w-quarter">
                        Percentage staked<br>
                        0.0%        
                    </td>
                    <td class="border rounded-r-b center p-1 w-quarter">
                        Index<br>1.0
                    </td>
                {/if}
            </tr>
        </table>
    </div>

    <table class="border w-full rounded shadow-1 mt-1 bg-white" style="background:linear-gradient(to right bottom, rgb(255 255 255), rgb(245 232 229))">
        <tr>
            <td class="center rounded-l-t rounded-r-t border py-1" colspan="4">
                <span class="uppercase large">locker</span><br>
                Get an extra revenue by locking your staked tokens and share 5% from all SoyFarm profits.<br>
                Locking period: 30 days
            </td>
        </tr>
        <tr>
            <td class="border p-0_5 border-b-dashed" colspan="2">
                <h3>Approve $BOOMER</h3>
                Allowance: {swjkAllowance2.gt(unlimited) ? "Unlimited" : ethers.utils.commify(ethers.utils.formatEther(swjkAllowance2))}
                <input class="w-full my-1 bg-transparent" bind:this="{inputLockerApproveIn}" type="text" placeholder="Amount">
                <button on:click="{approveInLocker}">Approve</button>
                <button on:click="{approveInUnlimitedLocker}">Approve unlimited</button>
            </td>
            <td class="border p-0_5 border-b-dashed" colspan="2">
                <h3>Approve $LOCK</h3>
                Allowance: {lockAllowance.gt(unlimited) ? "Unlimited" : ethers.utils.commify(ethers.utils.formatEther(lockAllowance))}
                <input class="w-full my-1 bg-transparent" bind:this="{inputLockerApproveOut}" type="text" placeholder="Amount">
                <button on:click="{approveOutLocker}">Approve</button>
                <button on:click="{approveOutUnlimitedLocker}">Approve unlimited</button>
            </td>
        </tr>
        <tr>
            <td class="border relative p-0_5 border-t-dashed" colspan="2">
                {#if !swjkAllowance2.gt("1")}
                    <div class="absolute l-0 t-0 w-full h-full half-transparent"></div>
                {/if}
                <h3>Deposit</h3>
                Balance: {format(myStaked)} $BOOMER (<span class="cblue hover:underline pointer" on:click="{maxLockerIn}" balance="{myStaked}">MAX</span>)
                <input class="w-full my-1 bg-transparent" bind:this="{inputLockerIn}" type="text" placeholder="Amount">
                <button on:click="{depositLocker}">Deposit</button>
                <button on:click="{depositAllLocker}">Deposit all</button>
                <br>Warning: Everytime you deposit or withdraw, the clock resets.
            </td>
            <td class="border relative p-0_5 border-t-dashed" colspan="2">
                {#if !lockAllowance.gt("1")}
                    <div class="absolute l-0 t-0 w-full h-full half-transparent"></div>
                {/if}
                <h3>Withdraw</h3>
                Balance: {format(myLocked)} $LOCK (<span class="cblue hover:underline pointer" on:click="{maxLockerOut}" balance="{myLocked}">MAX</span>)
                <input class="w-full my-1 bg-transparent" bind:this="{inputLockerOut}" type="text" placeholder="Amount">
                <button on:click="{withdrawLocker}">Withdraw</button>
                <button on:click="{withdrawAllLocker}">Withdraw all</button>
                <br>Warning: Everytime you deposit or withdraw, the clock resets.
            </td>
        </tr>
        <tr>
            <td class="border center p-1 w-quarter">Unlock timeleft<br>{getTimeRemaining(timeDifference)}</td>
            <td class="border center p-1 w-quarter">Current Epoch<br>{epochIndex}</td>
            <td class="border center p-1 w-quarter">Total $BOOMER Locked<br>{format(totalLocked)}</td>
            <td class="border center p-1 w-quarter">Locked value<br>{format(lockedValue)}$</td>
        </tr>
        <tr>
            <td class="border center p-1 w-quarter">BOO<br>{format(booRewards)}</td>
            <td class="border center p-1 w-quarter">CREDIT<br>{format(creditRewards)}</td>
            <td class="border center p-1 w-quarter">SCREAM<br>{format(screamRewards)}</td>
            <td class="border center p-1 w-quarter">TAROT<br>{format(tarotRewards)}</td>
        </tr>
        <tr>
            <td class="border rounded-l-b center p-1 w-quarter">BIFI<br>{format(bifiRewards)}</td>
            <td class="border center p-1 w-quarter">CRV<br>{format(crvRewards)}</td>
            <td class="border center p-1 w-quarter">USDC<br>{format(usdcRewards)}</td>
            <td class="border rounded-r-b center p-1 w-quarter">Total Reward Value<br>{format(rewardValue)}</td>
        </tr>
    </table>
{/if}