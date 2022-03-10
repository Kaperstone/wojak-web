<script>
export let address
export let provider
export let signer

const abi = ["function balanceOf(address) view returns (uint)"];

const contract = new ethers.Contract(address.token, abi, provider);


let myAddress = "Loading", myBalance = 0
async function init() {
    myAddress = await signer.getAddress();
    myBalance = (await contract.balanceOf(myAddress) / Math.pow(10, 18)).toFixed(4)
}
init()
</script>
Portfolio<br>
address: {myAddress}<br>
My balance: {myBalance}<br>
<br>
