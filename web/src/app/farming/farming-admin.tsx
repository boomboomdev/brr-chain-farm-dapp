import { FC,useRef,useState,useEffect } from 'react'
import {useFarmingProgram} from './farming-data-access'
import { AppHero, ellipsify } from '../ui/ui-layout';
export default function FarmingPage(){
    const {allPools, user_token_accounts}=useFarmingProgram()
    return (
        <>
        <AppHero
        title="Farming Admin"
        subtitle={''}>
            <CreatePool/>
            {!allPools.isLoading&&allPools.data&&allPools.data?.map((pool,index)=>{
                const tokenAccount=user_token_accounts.data?.value.find(ta=>{
                    return ta.account.data?.parsed?.info?.mint==pool.account.stakingMint.toString()
                });
                return (
                    <PoolCard ta={tokenAccount} key={index} account={pool} />
                )
            })}
        </AppHero>
        
        </>
    )
}
const CreatePool=()=>{
    const {initialize_pool}=useFarmingProgram()
    const refStakingMint=useRef<HTMLInputElement | null>(null);
    const refRewardMint=useRef<HTMLInputElement | null>(null);
    const initPool=()=>{
      const stakingMintStr=refStakingMint?.current?.value;
      const rewardAMintStr=refRewardMint?.current?.value;
      if(stakingMintStr&&rewardAMintStr)
      initialize_pool.mutateAsync({stakingMintStr,rewardAMintStr})
    }
    return (
      <div className='rounded w-full shadow-md px-5 py-5' >
          <div >
            <p className='text-xl' >Create Pool</p>
          </div>
          <div className='grid grid-cols-2 gap-4' >
            <div>
              <label htmlFor="deposit" className="block text-sm font-medium leading-6 text-gray-900">Token address : </label>
              <div className="mt-2">
                <div className="flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600 sm:max-w-md">
                  {/* <span className="flex select-none items-center pl-3 text-gray-500 sm:text-sm">Amount</span> */}
                  <input ref={refStakingMint} type="text" name="deposit-amount" id="deposit-amount" autoComplete="deposit-amount" className="block flex-1 border-0 bg-transparent py-1.5 pl-1 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6" placeholder=""/>
                </div>
              </div>
            </div>
            <div>
              <label htmlFor="withdraw" className="block text-sm font-medium leading-6 text-gray-900">Reward token address </label>
              <div className="mt-2">
                <div className="flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600 sm:max-w-md">
                  {/* <span className="flex select-none items-center pl-3 text-gray-500 sm:text-sm">Address</span> */}
                  <input ref={refRewardMint} type="text" name="withdraw-amount" id="withdraw-amount" autoComplete="withdraw-amount" className="block flex-1 border-0 bg-transparent py-1.5 pl-1 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6" placeholder=""/>
                </div>
              </div>
            </div>
            
          </div>
          <div className='mt-2' >
            <button type="button" onClick={e=>initPool()} className="rounded-md bg-green-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">Initialize</button>
          </div>
        </div>
    )
  }
  function PoolCard({account,ta}:{account:any,ta:any}){
    const {create_user,deposit,token_balance,user_staked,charge_reward}=useFarmingProgram()
    const refDepositAmount=useRef<HTMLInputElement|null>(null);
    const refWithdrawAmount=useRef<HTMLInputElement|null>(null);
    const [TokenBalance,setTokenBalance]=useState<string|undefined>("0.00");
    const [TokenStaked,setTokenStaked]=useState<string|undefined>("0.00");
    const [UserAccount,setUserAccount]=useState<any>(null);
    const [EsReward,setEsReward]=useState(0);
    const [TokenDeciaml,setTokenDeciaml]=useState(9);
    useEffect(()=>{
      if(account){
        console.log(account)
        user_staked.mutateAsync({pool:account.publicKey})
        .then(data=>{
          setTokenStaked((Number(data?.balanceStaked)/(10**TokenDeciaml)).toString());
          const lastUpdate=account.account.lastUpdateTime.toNumber();
          const now=Date.now()/1000;
          const period=now-lastUpdate;
          const estimate=2100000*(data?.balanceStaked.toNumber())*period/(365*86400*account.account.totalStaked.toNumber());
          setEsReward(estimate)
          setUserAccount(data);
        })
      }
    },[account])
    useEffect(()=>{
        if(ta) {
          token_balance.mutateAsync(ta.pubkey)
          .then(data=>{
            setTokenDeciaml(data.value.decimals);
            setTokenBalance(data.value.uiAmount?.toString())
          })
        } 
      },
    [ta])
  
    return (
      <>
        <div className='rounded w-full shadow-md px-5 py-5' >
            <div >
                <p className='' >Token : {account.account.stakingMint.toString()}</p>
                <p className='' >Reward : {account.account.rewardAMint.toString()}</p>
            </div>
            <div className='grid grid-cols-3 gap-2 mt-3' >
                <div>
                    <p>Total staked : {(Number(account.account.totalStaked)/(10**TokenDeciaml)).toString()}</p>
                </div>
                <div>
                    <p>Staked users : {account.account.userStakeCount}</p>
                </div>
                <div>
                    <p>Remaining rewards : {account.account.totalReward.toNumber()}</p>
                </div>
            </div>
            <div className='flex items-center justify-around mt-2' >
                <button type="button" onClick={e=>charge_reward.mutateAsync({pool:account.publicKey})} className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">Charge reward</button>
                <button type="button"  className="rounded-md bg-pink-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pink-600">Cloase pool</button>
            </div>
          
        </div>
      </>
    )
  }