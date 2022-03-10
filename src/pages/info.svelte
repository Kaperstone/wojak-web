<script>
export let account
export let token
export let signer
export let provider
export let connected

window.dispatch = () => getData()
if(connected) getData()


const growthMulti = 1 / 500
const lockerShare = 0.06

let SCREAM = 0, BOO = 0, TAROT = 0, CREDIT = 0, combined = 0,
    totalSupply = 0, price = 0, mcap = 0, usdcInTreasury = 0, totalStaked = 0, percStaked = 0,
    data= {
        treasury: {
            boo: {balance:{}},
            credit: {balance:{}},
            scream: {balance:{}},
            tarot: {balance:{}},
            usdc: {balance:{}},
            bifi: {balance:{}},
            crv: {balance:{}}
        },
        locker: {
            boo: {balance:0},
            credit: {balance:0},
            scream: {balance:0},
            tarot: {balance:0},
            usdc: {balance:0},
            bifi: {balance:0},
            crv: {balance:0},
        },
        keeper: {},
        soyfarm: {
            boo: {},
            credit: {},
            scream: {},
            tarot: {},
            usdc: {},
            bifi: {},
            crv: {},
        },
        price: {}
    },
    iterate= [],
    treasury_tvl = 0,
    soyfarm_tvl = 0,
    locker_tvl = 0,
    tvl = 0

async function getData() {
    if(typeof token.contracts !== "undefined") {
        const wojak = new ethers.Contract(token.contracts.token.address, token.contracts.token.abi, provider)
        const pair = new ethers.Contract(token.swap.pair.address, token.swap.pair.abi, provider)
        const wjk = new ethers.Contract(token.contracts.token.address, token.contracts.token.abi, provider)
        const zoomer = new ethers.Contract(token.contracts.zoomer.address, token.contracts.zoomer.abi, provider)
        const treasury = new ethers.Contract(token.contracts.treasury.address, token.contracts.treasury.abi, provider)
        const keeper = new ethers.Contract(token.contracts.keeper.address, token.contracts.keeper.abi, provider)
        const stakelocker = new ethers.Contract(token.contracts.stakelocker.address, token.contracts.stakelocker.abi, provider)

        const boo = new ethers.Contract(token.tokens.boo.address, token.tokens.boo.abi, provider)
        const credit = new ethers.Contract(token.tokens.credit.address, token.tokens.credit.abi, provider)
        const scream = new ethers.Contract(token.tokens.scream.address, token.tokens.scream.abi, provider)
        const tarot = new ethers.Contract(token.tokens.tarot.address, token.tokens.tarot.abi, provider)
        const usdc = new ethers.Contract(token.tokens.usdc.address, token.tokens.usdc.abi, provider)
        const bifi = new ethers.Contract(token.tokens.bifi.address, token.tokens.bifi.abi, provider)
        const crv = new ethers.Contract(token.tokens.crv.address, token.tokens.crv.abi, provider)
        const wftm = new ethers.Contract(token.tokens.wftm.address, token.tokens.wftm.abi, provider)
        
        const xboo = new ethers.Contract(token.tokens.xboo.address, token.tokens.xboo.abi, provider)
        const xcredit = new ethers.Contract(token.tokens.xcredit.address, token.tokens.xcredit.abi, provider)
        const xscream = new ethers.Contract(token.tokens.xscream.address, token.tokens.xscream.abi, provider)
        const xtarot = new ethers.Contract(token.tokens.xtarot.address, token.tokens.xtarot.abi, provider)
        const scusdc = new ethers.Contract(token.tokens.scusdc.address, token.tokens.scusdc.abi, provider)
        const scbifi = new ethers.Contract(token.tokens.scbifi.address, token.tokens.scbifi.abi, provider)
        const sccrv = new ethers.Contract(token.tokens.sccrv.address, token.tokens.sccrv.abi, provider)

        const boosoy = new ethers.Contract(token.contracts.boosoy.address, token.contracts.boosoy.abi, provider)
        const creditsoy = new ethers.Contract(token.contracts.creditsoy.address, token.contracts.creditsoy.abi, provider)
        const screamsoy = new ethers.Contract(token.contracts.screamsoy.address, token.contracts.screamsoy.abi, provider)
        const tarotsoy = new ethers.Contract(token.contracts.tarotsoy.address, token.contracts.tarotsoy.abi, provider)
        const usdcsoy = new ethers.Contract(token.contracts.usdcsoy.address, token.contracts.usdcsoy.abi, provider)
        const bifisoy = new ethers.Contract(token.contracts.bifisoy.address, token.contracts.bifisoy.abi, provider)
        const crvsoy = new ethers.Contract(token.contracts.crvsoy.address, token.contracts.crvsoy.abi, provider)
        
        const usdcftmpair = new ethers.Contract(token.swap.usdcftmpair.address, token.swap.usdcftmpair.abi, provider)
        const booftmpair = new ethers.Contract(token.swap.booftmpair.address, token.swap.booftmpair.abi, provider)
        const creditftmpair = new ethers.Contract(token.swap.creditftmpair.address, token.swap.creditftmpair.abi, provider)
        const screamftmpair = new ethers.Contract(token.swap.screamftmpair.address, token.swap.screamftmpair.abi, provider)
        const tarotftmpair = new ethers.Contract(token.swap.tarotftmpair.address, token.swap.tarotftmpair.abi, provider)
        const bififtmpair = new ethers.Contract(token.swap.bififtmpair.address, token.swap.bififtmpair.abi, provider)
        const crvftmpair = new ethers.Contract(token.swap.crvftmpair.address, token.swap.crvftmpair.abi, provider)

        let collector = []

        collector[0] = wojak.totalSupply()
        collector[1] = pair.getReserves()
        // collector[2] = treasury.usdcInTreasury()
        collector[3] = wojak.balanceOf(token.contracts.stake.address)

        collector[4] = boosoy.booBalance()
        collector[5] = creditsoy.creditBalance()
        collector[6] = screamsoy.screamBalance()
        collector[7] = tarotsoy.tarotBalance()
        collector[8] = usdcsoy.usdcBalance()

        collector[9] = boosoy.balanceOf(token.contracts.treasury.address)
        collector[10] = creditsoy.balanceOf(token.contracts.treasury.address)
        collector[11] = screamsoy.balanceOf(token.contracts.treasury.address)
        collector[12] = tarotsoy.balanceOf(token.contracts.treasury.address)
        collector[13] = usdcsoy.balanceOf(token.contracts.treasury.address)

        collector[14] = boo.balanceOf(token.contracts.treasury.address)
        collector[15] = credit.balanceOf(token.contracts.treasury.address)
        collector[16] = scream.balanceOf(token.contracts.treasury.address)
        collector[17] = tarot.balanceOf(token.contracts.treasury.address)
        collector[18] = usdc.balanceOf(token.contracts.treasury.address)

        collector[19] = usdc.balanceOf(token.contracts.keeper.address)
        collector[20] = wjk.balanceOf(token.contracts.keeper.address)
        
        collector[21] = usdcftmpair.getReserves()
        collector[22] = booftmpair.getReserves()
        collector[23] = creditftmpair.getReserves()
        collector[24] = screamftmpair.getReserves()
        collector[25] = tarotftmpair.getReserves()

        collector[26] = xboo.balanceOf(token.contracts.boosoy.address)
        collector[27] = xcredit.balanceOf(token.contracts.creditsoy.address)
        collector[28] = xscream.balanceOf(token.contracts.screamsoy.address)
        collector[29] = xtarot.balanceOf(token.contracts.tarotsoy.address)
        collector[30] = scusdc.balanceOf(token.contracts.usdcsoy.address)

        collector[31] = boosoy.balanceOf(token.contracts.stakelocker.address)
        collector[32] = creditsoy.balanceOf(token.contracts.stakelocker.address)
        collector[33] = screamsoy.balanceOf(token.contracts.stakelocker.address)
        collector[34] = tarotsoy.balanceOf(token.contracts.stakelocker.address)
        collector[35] = usdcsoy.balanceOf(token.contracts.stakelocker.address)

        
        collector[36] = bifisoy.bifiBalance()
        collector[37] = bifisoy.balanceOf(token.contracts.stakelocker.address)
        collector[38] = bifisoy.balanceOf(token.contracts.treasury.address)
        collector[39] = bifi.balanceOf(token.contracts.treasury.address)
        collector[40] = scbifi.balanceOf(token.contracts.bifisoy.address)

        collector[41] = crvsoy.crvBalance()
        collector[42] = crvsoy.balanceOf(token.contracts.stakelocker.address)
        collector[43] = crvsoy.balanceOf(token.contracts.treasury.address)
        collector[44] = crv.balanceOf(token.contracts.treasury.address)
        collector[45] = sccrv.balanceOf(token.contracts.crvsoy.address)
        
        collector[46] = bififtmpair.getReserves()
        collector[47] = crvftmpair.getReserves()
        
        collector[48] = treasury.statsSentToChad()
        collector[49] = treasury.statsBurntWJK()

        collector[50] = stakelocker.statsBurntWJK()

        collector[51] = wftm.balanceOf(token.contracts.treasury.address)
        collector[52] = provider.getBalance(token.contracts.treasury.address)

        // collector[53] = wojak.balanceOf(token.contracts.treasury.address)

        collector[54] = zoomer.balanceOf(token.contracts.boosoy.address)
        collector[55] = zoomer.balanceOf(token.contracts.creditsoy.address)
        collector[56] = zoomer.balanceOf(token.contracts.screamsoy.address)
        collector[57] = zoomer.balanceOf(token.contracts.tarotsoy.address)
        collector[58] = zoomer.balanceOf(token.contracts.usdcsoy.address)
        collector[59] = zoomer.balanceOf(token.contracts.bifisoy.address)
        collector[60] = zoomer.balanceOf(token.contracts.crvsoy.address)

        Promise.all(collector).then(async values => {
            totalSupply = parseFloat(ethers.utils.formatEther(values[0]))
            const
                res0 = parseFloat(ethers.utils.formatUnits(values[1][0], token.tokens.usdc.decimals)),
                res1 = parseFloat(ethers.utils.formatUnits(values[1][1]))
            price = res0 / res1
            
            mcap = totalSupply * price
            // usdcInTreasury = ethers.utils.commify(ethers.utils.formatUnits(values[2], 6))
            totalStaked = parseFloat(ethers.utils.formatEther(values[3]))
            percStaked = 1 / (totalSupply / totalStaked)

            // SCREAM = totalSupply * percStaked * Math.pow(1 + growthMulti, 365) * price * (1 / 0.10) /4
            // BOO = totalSupply * percStaked * Math.pow(1 + growthMulti, 365) * price * (1 / 0.10) /4
            // TAROT = totalSupply * percStaked * Math.pow(1 + growthMulti, 365) * price * (1 / 0.10) /4
            // CREDIT = totalSupply * percStaked * Math.pow(1 + growthMulti, 365) * price * (1 / 0.10) /4
            combined = totalSupply * percStaked * Math.pow(1.0025, 365) * price * (1 / 0.3)
            
            {
                const
                    res0 = parseFloat(ethers.utils.formatUnits(values[21][0], token.tokens.usdc.decimals)),
                    res1 = parseFloat(ethers.utils.formatUnits(values[21][1]))
                data.price.ftm = res0 / res1
            }
            {
                const
                    res0 = parseFloat(ethers.utils.formatUnits(values[22][0])),
                    res1 = parseFloat(ethers.utils.formatUnits(values[22][1]))
                data.price.boo = res0 / res1
            }
            {
                const
                    res0 = parseFloat(ethers.utils.formatUnits(values[23][0])),
                    res1 = parseFloat(ethers.utils.formatUnits(values[23][1]))
                data.price.credit = res0 / res1
            }
            {
                const
                    res0 = parseFloat(ethers.utils.formatUnits(values[24][0])),
                    res1 = parseFloat(ethers.utils.formatUnits(values[24][1]))
                data.price.scream = res0 / res1
            }
            {
                const
                    res0 = parseFloat(ethers.utils.formatUnits(values[25][0])),
                    res1 = parseFloat(ethers.utils.formatUnits(values[25][1]))
                data.price.tarot = res0 / res1
            }
            {
                const
                    res0 = parseFloat(ethers.utils.formatUnits(values[46][0])),
                    res1 = parseFloat(ethers.utils.formatUnits(values[46][1]))
                data.price.bifi = res0 / res1
            }
            {
                const
                    res0 = parseFloat(ethers.utils.formatUnits(values[47][0])),
                    res1 = parseFloat(ethers.utils.formatUnits(values[47][1]))
                data.price.crv = res1 / res0
            }

            data.boo = true
            data.soyfarm.boo.currentBalance = ethers.utils.formatEther(values[4])
            data.locker.boo = ethers.utils.formatEther(values[31])
            data.treasury.boo.balance = {
                soy: ethers.utils.formatEther(values[9]),
                boo: ethers.utils.formatEther(values[14])
            }
            // LTOKEN.BOOBalance(address(this)) - booBalance
            const tmp = await xboo.BOOBalance(token.contracts.boosoy.address)
            data.soyfarm.boo.profit = format(ethers.utils.formatEther(tmp.sub(values[4])))
            data.soyfarm.boo.worth = parseFloat(ethers.utils.formatEther(tmp))
            data.soyfarm.boo.xbalance = format(ethers.utils.formatEther(values[26]))
            data.treasury.boo.xworth = format(ethers.utils.formatEther(await xboo.BOOForxBOO(values[9])))

            data.credit = true
            data.soyfarm.credit.currentBalance = parseFloat(ethers.utils.formatEther(values[5]))
            data.locker.credit = ethers.utils.formatEther(values[32])
            data.treasury.credit.balance = {
                soy: ethers.utils.formatEther(values[10]),
                credit: ethers.utils.formatEther(values[15])
            }
            const credit_isupply = await credit.balanceOf(token.tokens.xcredit.address)
            const credit_xsupply = await xcredit.totalSupply()
            const xcreditBalance = values[27]
            const xcreditWorth = parseFloat(ethers.utils.formatEther(xcreditBalance.mul(credit_isupply).div(credit_xsupply)))

            data.soyfarm.credit.profit = format(xcreditWorth - data.soyfarm.credit.currentBalance)
            data.soyfarm.credit.worth = parseFloat(xcreditWorth)
            data.soyfarm.credit.xbalance = format(ethers.utils.formatEther(values[27]))
            data.treasury.credit.xworth = format(ethers.utils.formatEther(values[10].mul(credit_xsupply).div(credit_isupply)))

            data.scream = true
            data.soyfarm.scream.currentBalance = parseFloat(ethers.utils.formatEther(values[6]))
            data.locker.scream = ethers.utils.formatEther(values[33])
            data.treasury.scream.balance = {
                soy: ethers.utils.formatEther(values[11]),
                scream: ethers.utils.formatEther(values[16])
            }
            const scream_isupply = await scream.balanceOf(token.tokens.xscream.address)
            const scream_xsupply = await xscream.totalSupply()
            const xscreamBalance = values[28]
            const xscreamWorth = parseFloat(ethers.utils.formatUnits(xscreamBalance.mul(scream_isupply).div(scream_xsupply)))
            
            data.soyfarm.scream.profit = format(xscreamWorth - data.soyfarm.scream.currentBalance); // worth - savedBalance
            data.soyfarm.scream.worth = parseFloat(xscreamWorth)
            data.soyfarm.scream.xbalance = format(ethers.utils.formatEther(values[28]))
            data.treasury.scream.xworth = format(ethers.utils.formatEther(values[11].mul(scream_xsupply).div(scream_isupply)))

            data.tarot = true
            data.soyfarm.tarot.currentBalance = ethers.utils.formatEther(values[7])
            data.locker.tarot = ethers.utils.formatEther(values[34])
            data.treasury.tarot.balance = {
                soy: ethers.utils.formatUnits(values[12]),
                tarot: ethers.utils.formatUnits(values[17])
            }
            const underlying = await xtarot.underlyingBalanceForAccount(token.contracts.tarotsoy.address)
            const tarotProfit = underlying.sub(values[7])
            data.soyfarm.tarot.profit = format(ethers.utils.formatEther(tarotProfit))
            data.soyfarm.tarot.worth = parseFloat(ethers.utils.formatEther(underlying))
            data.soyfarm.tarot.xbalance = format(ethers.utils.formatEther(values[29]))
            data.treasury.tarot.xworth = format(ethers.utils.formatEther(await xtarot.underlyingValuedAsShare(values[12])))

            data.usdc = true
            data.soyfarm.usdc.currentBalance = ethers.utils.formatUnits(values[8], 6)
            data.locker.usdc = ethers.utils.formatUnits(values[35], 6)
            data.treasury.usdc.balance = {
                soy: ethers.utils.formatUnits(values[18], 6), // ethers.utils.formatUnits(values[13])
                usdc: ethers.utils.formatUnits(values[18])
            }
            const underlyingUsdc = await scusdc.balanceOfUnderlying(token.contracts.usdcsoy.address)
            data.soyfarm.usdc.profit = format(ethers.utils.formatUnits(underlyingUsdc.sub(values[8]), 6))
            data.soyfarm.usdc.worth = parseFloat(ethers.utils.formatUnits(underlyingUsdc, 6))
            data.soyfarm.usdc.xbalance = format(ethers.utils.formatUnits(values[30], 8))
            data.price.usdc = 1

            data.bifi = true
            data.soyfarm.bifi.currentBalance = ethers.utils.formatUnits(values[36], 18)
            data.locker.bifi = ethers.utils.formatUnits(values[37], 18)
            data.treasury.bifi.balance = {
                soy: ethers.utils.formatUnits(values[38]),
                bifi: ethers.utils.formatUnits(values[39])
            }
            const underlyingBifi = await scbifi.balanceOfUnderlying(token.contracts.bifisoy.address)
            data.soyfarm.bifi.profit = format(ethers.utils.formatUnits(underlyingBifi.sub(values[36]), 18))
            data.soyfarm.bifi.worth = parseFloat(ethers.utils.formatUnits(underlyingBifi, 18))
            data.soyfarm.bifi.xbalance = format(ethers.utils.formatUnits(values[40], 8))

            data.crv = true
            data.soyfarm.crv.currentBalance = ethers.utils.formatUnits(values[41], 18)
            data.locker.crv = ethers.utils.formatUnits(values[42], 18)
            data.treasury.crv.balance = {
                soy: ethers.utils.formatUnits(values[43]),
                crv: ethers.utils.formatUnits(values[44])
            }
            const underlyingCrv = await sccrv.balanceOfUnderlying(token.contracts.crvsoy.address)
            data.soyfarm.crv.profit = format(ethers.utils.formatEther(underlyingCrv.sub(values[41])))
            data.soyfarm.crv.worth = parseFloat(ethers.utils.formatEther(underlyingCrv))
            data.soyfarm.crv.xbalance = format(ethers.utils.formatUnits(values[45], 8))

            data.keeper.usdcBalance = format(ethers.utils.formatEther(values[19]))
            data.keeper.wjkBalance = format(ethers.utils.formatEther(values[20]))

            data.treasury.statsSentToChad = format(ethers.utils.formatEther(values[48]))
            data.treasury.statsBurntWJK = format(ethers.utils.formatEther(values[49]))

            // data.treasury.statsSentToChad = values[48]
            // data.treasury.statsBurntWJK = values[49]

            data.locker.statsBurntWJK = format(ethers.utils.formatEther(values[50]))

            data.treasury.wftm = format(parseFloat(ethers.utils.formatEther(values[51])) + parseFloat(ethers.utils.formatEther(values[52])))

            // data.treasury.wjk = format(ethers.utils.formatEther(values[53]))
            
            data.soyfarm.boo.debt = format(ethers.utils.formatEther(values[54]))
            data.soyfarm.credit.debt = format(ethers.utils.formatEther(values[55]))
            data.soyfarm.scream.debt = format(ethers.utils.formatEther(values[56]))
            data.soyfarm.tarot.debt = format(ethers.utils.formatEther(values[57]))
            data.soyfarm.usdc.debt = format(ethers.utils.formatEther(values[58]))
            data.soyfarm.bifi.debt = format(ethers.utils.formatEther(values[59]))
            data.soyfarm.crv.debt = format(ethers.utils.formatEther(values[60]))

            iterate = []

            let y = 0
            treasury_tvl = 0
            soyfarm_tvl = 0
            locker_tvl = 0
            for(let x in data.soyfarm) {
                iterate[y++] = x
                
                treasury_tvl += parseFloat(data.treasury[x].balance.soy) * data.price[x]
                soyfarm_tvl += data.soyfarm[x].worth * data.price[x]
                locker_tvl += parseFloat(data.locker[x]) * data.price[x]
            }
            tvl = treasury_tvl + soyfarm_tvl + locker_tvl + (totalStaked * price)
        })
    }
}

function format(number) {
    if(typeof number === "undefined" || isNaN(number)) return 0;
    return ethers.utils.commify(parseFloat(number).toFixed(2))
}
</script>

{#if !connected}
    <div style="background:#eee;padding:1rem;border:1px solid #aaa;border-radius:.5rem">
        Connect wallet first or change to a supported blockchain,<br>the website uses wallet connection to connect to the blockchain
    </div>
{:else}
    <div class="mb-1">The place for all the numbers</div>
    <div>
        <table class="w-full center bg-white border rounded">
            <tr>
                <td class="p-1"><span class="bold miniheader">WJK Price</span><br>{ethers.utils.commify(price.toFixed(4))}$</td>
                <td class="p-1"><span class="bold miniheader">Market cap</span><br>{ethers.utils.commify(mcap.toFixed(0))}$</td>
                <td class="p-1"><span class="bold miniheader">Circulating Supply</span><br>{ethers.utils.commify(totalSupply.toFixed(2))}</td>
            </tr>
            <tr>
                <td class="p-1"><span class="bold miniheader">Growth value</span><br>{ethers.utils.commify(( totalSupply * percStaked * Math.pow(1 + growthMulti, 365) * price ).toFixed(0))}$</td>
                <td class="p-1"><span class="bold miniheader">Target Treasury</span><br>{ethers.utils.commify(( combined + (combined * lockerShare) ).toFixed(0))}$</td>
                <td class="p-1"><span class="bold miniheader">TVL</span><br>{format(tvl)}$</td>
            </tr>
        </table>


        <!-- /////// TREASURY //////// -->

        <div class="border-solid border-2 pblue p-1 shadow bg-white mt-1 rounded">
            <div class="pb-1 center">TREASURY</div>
            <div class="center my-1">
                <span class="border rounded-full py-0_5 px-1">TVL: {format(treasury_tvl)}$</span>
                <span class="border rounded-full py-0_5 px-1">Filled Chad: {data.treasury.statsSentToChad}</span>
                <span class="border rounded-full py-0_5 px-1">Burnt WJK: {data.treasury.statsBurntWJK}</span>
                <span class="border rounded-full py-0_5 px-1">WFTM: {data.treasury.wftm}</span>
                <!-- <span class="border rounded-full py-0_5 px-1">WJK: {data.treasury.wjk}</span> -->
            </div>
            {#each iterate as f}
                {#if data[f]}
                <div class="inline-block small border bg-gray rounded-full mr-1 mt-1">
                    <div class="inline-block rounded-full bg-white align-middle">
                        <img class="inline-block h-1_5 align-middle" src="/static/images/{f}.webp" alt="{f}">
                        <span class="inline-block px-0_5 align-middle leading-1_5">{f}SOY</span>
                    </div>
                    <div class="inline-block align-middle rounded-r-full h-1_5 px-0_5 leading-1_5">{format(data.treasury[f].balance.soy)}</div>
                </div>
                {/if}
            {/each}
            <div class="mt-1">Balance:</div>
            {#each iterate as f}
                {#if data[f]}
                <div class="inline-block small border bg-gray rounded-full mr-1 mt-1">
                    <div class="inline-block rounded-full bg-white align-middle">
                        <img class="inline-block h-1_5 align-middle" src="/static/images/{f}.webp" alt="{f}">
                        <span class="inline-block px-0_5 align-middle leading-1_5 uppercase">{f}</span>
                    </div>
                    <div class="inline-block align-middle rounded-r-full h-1_5 px-0_5 leading-1_5">{format(data.treasury[f].balance[f])}</div>
                </div>
                {/if}
            {/each}
        </div>


        <!-- /////// LOCKER //////// -->

        <div class="border-solid border-2 pgreen p-1 shadow bg-white mt-1 rounded">
            <div class="pb-1 center">LOCKER</div>
            <div class="center my-1">
                <span class="border rounded-full py-0_5 px-1">TVL: {format(locker_tvl)}$</span>
                <span class="border rounded-full py-0_5 px-1">Burnt WJK: {format(data.locker.statsBurntWJK)}</span>
            </div>
            {#each iterate as f}
                {#if data[f]}
                <div class="inline-block small border bg-gray rounded-full mr-1 mt-1">
                    <div class="inline-block rounded-full bg-white align-middle">
                        <img class="inline-block h-1_5 align-middle" src="/static/images/{f}.webp" alt="{f}">
                        <span class="inline-block px-0_5 align-middle leading-1_5 uppercase">{f}</span>
                    </div>
                    <div class="inline-block align-middle rounded-r-full h-1_5 px-0_5 leading-1_5">{format(data.locker[f])}</div>
                </div>
                {/if}
            {/each}
        </div>

        <!-- /////// SOYFARMS //////// -->

        <div class="border-solid border-2 carrot p-1 shadow bg-white mt-1 rounded">
            <div class="pb-1 center">SOYFARMS</div>

            <div class="center my-1"><span class="border rounded-full py-0_5 px-1">TVL: {format(soyfarm_tvl)}$</span></div>

            {#each iterate as f}
                {#if data[f]}
                <table class="inline-table mt-0_5 w-third">
                    <tr>
                        <td>
                            <img class="inline-block w-2 align-middle" src="/static/images/{f}.webp" alt="boo">
                        </td>
                        <td class="pl-0_5">
                            <span class="inline-block align-middle header left large bold"><span class="uppercase">{f}</span> Farm</span> - {parseFloat(data.price[f]).toFixed(2)}$
                        </td>
                    </tr>
                    <tr>
                        <td></td>
                        <td><span class="mild-gray"><span class="uppercase">{f}</span> deposited</span><br>{format(data.soyfarm[f].currentBalance)} ({format(data.soyfarm[f].worth * data.price[f])}$)</td>
                    </tr>
                    <tr>
                        <td></td>
                        <td><span class="mild-gray">Profit</span><br>{data.soyfarm[f].profit}</td>
                    </tr>
                    <tr>
                        <td></td>
                        <td><span class="mild-gray">Debt</span><br>{data.soyfarm[f].debt}</td>
                    </tr>
                </table>
                {/if}
            {/each}
        </div>

        
        <!-- /////// KEEPER //////// -->

        <table class="w-full center bg-white mt-1 shadow blue">
            <tr>
                <td class="border" colspan="99">Keeper</td>
            </tr>
            <tr>
                <td class="border" colspan="2">USDC Balance<br>{data.keeper.usdcBalance}$</td>
                <td class="border" colspan="2">WJK Balance<br>{data.keeper.wjkBalance} WJK</td>
            </tr>
            <tr>
                <td class="border" colspan="4">Liquidity owned<br>{data.keeper.forLiquidity}</td>
            </tr>
        </table>
    </div>
{/if}