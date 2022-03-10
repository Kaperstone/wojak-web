<!-- svelte-ignore ethers -->
<script>
import Comp from __pagePath__
import goerli from "./json/goerli.json"
import localhost from "./json/localhost.json"
import Notifications from "svelte-notifications"

let connected = false;

let token = {}, account = {
	address: window.ethereum.selectedAddress,
	nbalance: "0",
	 balance: "0",
	  staked: "0",
	   index: "1",
	connected: false
}

let chains = []
chains[5] = goerli
chains[1337] = localhost

window.dispatch = function() {}

const provider = new ethers.providers.Web3Provider(window.ethereum, "any")
const signer = provider.getSigner(0)
let lastKeepText ="",
	lastKeep = Math.round(new Date() / 1000),
	lastDistText ="",
	lastDist = Math.round(new Date() / 1000),
	totalUpkeeps = 0,
	totalDists = 0,
	wojak,
	stake,
	keeper,
	stakelocker,
	nonce = 0

async function connect() {
	await provider.send("eth_requestAccounts", []).then(() => load(parseInt(window.ethereum.networkVersion)))
}

setInterval(() => {
	lastKeepText = getTimeRemaining(lastKeep)
	lastDistText = getTimeRemaining(lastDist)
}, 1000)

let lastLoad = new Date()

async function load(chainId, onNewBlock) {
	// console.log("chainid=" + chainId)
	if(typeof chains[chainId] !== "undefined") {
		if(typeof onNewBlock === "undefined" || onNewBlock == true && new Date() - lastLoad > 5000) {
			lastLoad = new Date()
			token = chains[chainId]
	
			if(wojak == null) {
				wojak = new ethers.Contract(token.contracts.token.address, token.contracts.token.abi, signer);
				stake = new ethers.Contract(token.contracts.stake.address, token.contracts.stake.abi, signer);
				keeper = new ethers.Contract(token.contracts.keeper.address, token.contracts.keeper.abi, signer);
				stakelocker = new ethers.Contract(token.contracts.stakelocker.address, token.contracts.stakelocker.abi, signer)
			}
	
			let collector = []
	
			collector[0] = keeper.lastKeep()
			collector[1] = keeper.totalUpkeeps()
			collector[7] = keeper.lastDist()
			collector[8] = keeper.dists()
	
			connected = true;
	
			if(typeof window.ethereum.selectedAddress === "string") {
				account.address = window.ethereum.selectedAddress
				
				collector[2] = provider.getBalance(account.address)
				
				collector[3] = wojak.balanceOf(account.address)
				collector[4] = stake.balanceOf(account.address)
				collector[5] = stake.index()
				collector[6] = stakelocker.balanceOf(account.address)
	
				account.connected = true
				
				// The rest
			}
	
			Promise.all(collector).then(values => {
				lastKeep = parseInt(values[0]) + 86400
				totalUpkeeps = parseInt(values[1])
				lastDist = parseInt(values[7]) + 3600
				totalDists = parseInt(values[8])
	
				if(typeof window.ethereum.selectedAddress === "string") {
					account.nbalance = values[2]
					
					account.balance = values[3]
					account.staked = values[4].add(values[6])
					account.index = values[5]
				}
				window.dispatch()
			})
		}
	}else connected = false;
}


let tt
provider.on("network", async (network, oldNetwork) => {
	console.log("Changed accounts")
	provider.send("eth_requestAccounts", []).then(() => load(network.chainId))

	// Sometimes we receive two or more blocks at the same time because of delays
	// To ensure constant up-to-date
	if(typeof token.chain !== "undefined") {
		// clearInterval(tt)
		// tt = setInterval(() => {
		// 	if(connected) load(parseInt(window.ethereum.networkVersion), true)
		// }, token.chain.blockTime * 1000)
	}
})

provider.on("block", () => {
	// console.log("block")
	if(connected) {
		load(parseInt(token.chain.id), true)
		signer.getTransactionCount().then(n => nonce = n)
	}
})

provider.on("error", error => console.error(error))

function getTimeRemaining(endtime) {
	if(Math.round(new Date() / 1000) < endtime) {
		const total = endtime - Math.round(new Date() / 1000);
		return "" + Math.floor( (total/3600) % 24 ) + "hr " + Math.floor( (total/60) % 60 ) + "min " + Math.floor( total % 60 ) + "sec"
	}else{
		return "0hr 0min 0sec"
	}
}

const warnHim = `DISCLAIMER: THIS LIKE EVERY OTHER PROJECT, IS EXPERIMENTAL, USE AT YOUR OWN RISK. WE DON'T HAVE INSURANCE BRO`;
</script>
<Notifications>
	<div style="position:absolute;left:0;top:0;width:100%;background:#e74c3c;color:#fff;font-size:12px;padding:.25rem">{@html warnHim}</div>
	<div style="width:1024px;margin:0 auto;position:relative">
		<div style="margin:2rem auto;width:64rem;min-height:600px;font-size:.85rem">
			<div style="display:inline-block;vertical-align:top;width:10rem;padding:1rem;border-right:1px solid #363636;text-align:center">
				Wojak Token
				{#if window.location.pathname == "/stake"}
					<img style="width:80%;padding:1rem 0" src="/static/images/boomer.webp" alt="Boomer Face">
				{:else if window.location.pathname == "/dashboard"}
					<img style="width:80%;padding:1rem 0" src="/static/images/cat.webp" alt="ITS A CAT">
				{:else if window.location.pathname == "/bonds"}
					<img style="width:80%;padding:1rem 0" src="/static/images/chad.webp" alt="Chad Face">
				{:else if window.location.pathname == "/soyfarms"}
					<img style="width:80%;padding:1rem 0" src="/static/images/soyboy.webp" alt="Soyboy Face">
				{:else if window.location.pathname == "/admin"}
					<img style="width:80%;padding:1rem 0" src="/static/images/pirate.webp" alt="Wojak Pirate Face">
				{:else if window.location.pathname == "/bridge"}
					<img style="width:80%;padding:1rem 0" src="/static/images/pepe_insuit.webp" alt="Soyboy Face">
				{:else}
					<img style="width:80%;padding:1rem 0" src="/static/images/wojak.webp" alt="Wojak Face">
				{/if}
				<span>
					Experimental<br>
					wealth building token
				</span>
				<br><br>
				<div style="margin-bottom:1rem">We maybe not moon,<br>but its honest work.</div>
		
				<ul style="text-align:left" class="menu">
					<a href="/"><li>Hom</li></a>
					<a href="/dashboard"><li>Dashboard</li></a>
					<a href="/stake"><li>Boomer Stake</li></a>
					<a href="/bonds"><li>Chad Bonds</li></a>
					<a href="/soyfarms"><li>SoyFarms</li></a>
					<a href="/bridge"><li>Bridge</li></a>
					<!--
						<a href="/rebase"><li><s>Mumu & Bobo</s></li></a>
						<li><s>Coomer Farms</s></li>
						<li><s>Soyjak Loans</s></li>
						<li><s>Mooner Launch</s></li>
						<li><s>Zoomer Swap</s></li>
					-->
				</ul>
				<br>
				<div style="text-align:left">
					<div style="background:#eee;border-radius:.5rem;padding:.5rem .75rem;margin-top:.5rem">
						Next keep (epoch {totalUpkeeps})<br>
						{#if lastKeep != 0}
							{lastKeepText}
						{/if}
					</div>
					<div style="background:#eee;border-radius:.5rem;padding:.5rem .75rem;margin-top:.5rem">
						Next dist ({totalDists})<br>
						{#if lastDist != 0}
							{lastDistText}
						{/if}
					</div>
				</div>
				<br>
				<br>
				<br>
				<div style="text-align:left">
					<a href="/admin"><div>Admin Panel</div></a>
					<div style="overflow:hidden;text-overflow:ellipsis">Holdings:<br>
						<span>{ethers.utils.commify(parseFloat(ethers.utils.formatEther(account.balance)))}</span>
					</div>
					<div style="overflow:hidden;text-overflow:ellipsis">Staked:<br>
						<span>{ethers.utils.commify((parseFloat(ethers.utils.formatEther(account.staked)) * parseFloat(ethers.utils.formatEther(account.index))).toFixed(4).toString())}</span>
					</div>
				</div>
				{#if typeof token.chain !== "undefined"}
					<div style="margin-top:1rem;text-align:center;width:100%;font-size:12px">
						{token.chain.name}<br>
						{ethers.utils.commify((account.nbalance / Math.pow(10, 18)).toFixed(4))} {token.chain.currency}
					</div>
				{/if}
				<div style="margin-top:.1rem;border:1px solid #ccc;border-radius:.25rem;padding:.25rem;background:#f0f0f0;overflow:hidden;text-overflow:ellipsis;max-width:10rem">
					{#if account.address == "" || typeof account.address === "undefined"}
						<button on:click="{connect}">Connect</button>
					{:else}
						{account.address}
					{/if}
				</div>
				Nonce: {nonce}<br>
				<a href="https://twitter.com/wojak_bro"><div class="twitter h-3 w-3 bg-black pointer mt-1 inline-block" title="Twitter"></div></a>
				<a href="https://kaperstone.gitbook.io/wojak-1/"><div class="docs h-3 w-3 bg-black pointer mt-1 inline-block" title="Documentation"></div></a>
				<a href="https://t.me/wojak_bro"><div class="telegram h-3 w-3 bg-black pointer mt-1 inline-block" title="Telegram"></div></a>
			</div>
			<div style="display:inline-block;vertical-align:top;padding:1rem;width:48rem">
				<Comp 
						bind:token bind:account 
						bind:wojak bind:stake bind:stakelocker
						bind:connected {provider} {signer}
						bind:nonce
				></Comp>
			</div>
		</div>

		{#if window.location.pathname == "/stake"}
			<iframe class="bg-face" style="margin-left:-175px" src="/static/ascii/boomer.html" title="BOOMER"></iframe>
		{:else if window.location.pathname == "/dashboard"}
			<iframe class="bg-face" src="/static/ascii/cat.html" title="Depressed cat"></iframe>
		{:else if window.location.pathname == "/bonds"}
			<iframe class="bg-face" src="/static/ascii/chad.html" title="CHAD"></iframe>
		{:else if window.location.pathname == "/soyfarms"}
			<iframe class="bg-face" src="/static/ascii/soyjak.html" title="SOYJAK"></iframe>
		{:else if window.location.pathname == "/admin"}
			<img class="bg-face" src="/static/images/pirate.webp" alt="Wojak Pirate Face">
		{:else if window.location.pathname == "/bridge"}
			<iframe class="bg-face" src="/static/ascii/pepe.html" title="pipi"></iframe>
		{:else}
			<iframe class="bg-face" src="/static/ascii/wojak.html" title="WJK"></iframe>
		{/if}
	</div>
</Notifications>