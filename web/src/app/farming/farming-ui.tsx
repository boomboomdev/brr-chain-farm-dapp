import { Keypair, PublicKey } from '@solana/web3.js';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ellipsify } from '../ui/ui-layout';
import { ExplorerLink } from '../cluster/cluster-ui';
import {
  useFarmingProgram,
  useFarmingProgramAccount,
} from './farming-data-access';

export function FarmingCreate() {
  const [AllPools,setAllPools]=useState([]);
  const { initialize,initialize_pool,get_pools,allPools, user_token_accounts} = useFarmingProgram();
  
  return (
    <>
    
      <div className='flex justify-around' >
        {/* <button
          className="btn btn-xs lg:btn-md btn-primary"
          onClick={() => deposit.mutateAsync(10)}
          disabled={deposit.isPending}
        >
          Test {deposit.isPending && '...'}
        </button> */}
        {/* <button
          className="btn btn-xs lg:btn-md btn-primary"
          onClick={() => initialize_pool.mutateAsync()}
          disabled={initialize_pool.isPending}
        >
          Create Pool {initialize_pool.isPending && '...'}
        </button> */}
        {/* <button
          className="btn btn-xs lg:btn-md btn-primary"
          onClick={() => get_pools.mutateAsync()}
          disabled={get_pools.isPending}
        >
          Get Pools {get_pools.isPending && '...'}
        </button> */}
      </div>
    
    </>
  );
}

export function FarmingList() {
  const { accounts, getProgramAccount,allPools,user_token_accounts} = useFarmingProgram();
  if (getProgramAccount.isLoading) {
    return <span className="loading loading-spinner loading-lg"></span>;
  }
  if (!getProgramAccount.data?.value) {
    return (
      <div className="alert alert-info flex justify-center">
        <span>
          Program account not found. Make sure you have deployed the program and
          are on the correct cluster.
        </span>
      </div>
    );
  }
  return (
    <div className={'space-y-6'}>
      {
        allPools.isLoading?(
          <></>
        ):(
          <>
          {user_token_accounts.isLoading?(<></>):(
            <>
              {allPools.data?.map((pool,index)=>{
                const tokenAccount=user_token_accounts.data?.value.find(ta=>{
                  return ta.account.data?.parsed?.info?.mint==pool.account.stakingMint.toString()
                });
                return (
                  <PoolCard key={index} account={pool} ta={tokenAccount} />
                )
              })}
            </>
          )}
          </>
        )
      }
      {/* {accounts.isLoading ? (
        <span className="loading loading-spinner loading-lg"></span>
      ) : accounts.data?.length ? (
        <div className="grid md:grid-cols-2 gap-4">
          {accounts.data?.map((account) => (
            <FarmingCard
              key={account.publicKey.toString()}
              account={account.publicKey}
            />
          ))}
        </div>
      ) : (
        <div className="text-center">
          <h2 className={'text-2xl'}>No accounts</h2>
          No accounts found. Create one above to get started.
        </div>
      )} */}
      <CreatePool/>
    </div>
  );
}
function PoolCard({account,ta}:{account:any,ta:any}){
  const {create_user,deposit,token_balance,user_staked,withdraw,claim}=useFarmingProgram()
  const refDepositAmount=useRef<HTMLInputElement|null>(null);
  const refWithdrawAmount=useRef<HTMLInputElement|null>(null);
  const [TokenBalance,setTokenBalance]=useState<string|undefined>("0.00");
  const [TokenStaked,setTokenStaked]=useState<string|undefined>("0.00");
  const [UserAccount,setUserAccount]=useState<any>(null);
  const [EsReward,setEsReward]=useState(0);
  useEffect(()=>{
    if(ta) {
      token_balance.mutateAsync(ta.pubkey)
      .then(data=>{
        setTokenBalance(data.value.amount)
      })
    } 
  },
    [ta])
  useEffect(()=>{
    if(account){
      user_staked.mutateAsync({pool:account.publicKey})
      .then(data=>{
        setTokenStaked(data?.balanceStaked.toString());
        console.log(account,data)
        const lastUpdate=account.account.lastUpdateTime.toNumber();
        const now=Date.now()/1000;
        const period=now-lastUpdate;
        const estimate=2100000*(data?.balanceStaked.toNumber())*period/(365*86400*account.account.totalStaked.toNumber());
        console.log(estimate)
        setEsReward(estimate)
        setUserAccount(data);
      })
    }
  },[account])
  const depositPool=()=>{
    var amount=refDepositAmount?.current?.value;

    const stakingMintStr=account.account.stakingMint;
    const rewardAMintStr=account.account.rewardAMint;
    if(amount)
      deposit.mutateAsync({userTAstr:ta.pubkey.toString(),pool:account.publicKey,amount:Number(amount)})
    .then(()=>{
      token_balance.mutateAsync(ta.pubkey)
      .then(data=>{
        setTokenBalance(data.value.amount)
      });
      user_staked.mutateAsync({pool:account.publicKey})
      .then(data=>{
        setTokenStaked(data?.balanceStaked.toString());
        setUserAccount(data);
      })
    })
  }
  const withdrawPool=()=>{
    var amount=refWithdrawAmount?.current?.value;
    if(amount)
      withdraw.mutateAsync({userTAstr:ta.pubkey.toString(),pool:account.publicKey,amount:Number(amount)})
    .then(()=>{
      token_balance.mutateAsync(ta.pubkey)
      .then(data=>{
        setTokenBalance(data.value.uiAmountString)
      });
      user_staked.mutateAsync({pool:account.publicKey})
      .then(data=>{
        setTokenStaked(data?.balanceStaked.toString());
        setUserAccount(data);
      })
    })
  }
  const claimReward=()=>{
    claim.mutateAsync({pool:account.publicKey})
  }

  return (
    <>
      <div className='rounded w-full shadow-md px-5 py-5' >
        <div >
          <p className='text-xl' >Token : {account.account.stakingMint.toString()}</p>
          <p className='text-xl' >Reward : {account.account.rewardAMint.toString()}</p>
        </div>
        {ta?(
        <>
          <div className='grid grid-cols-3 gap-4' >
          <div>
            <div className="mt-2">
              <div className="flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600 sm:max-w-md">
                <span className="flex select-none items-center pl-3 text-gray-500 sm:text-sm">Amount</span>
                <input type="number" ref={refDepositAmount} name="deposit-amount" id="deposit-amount" autoComplete="deposit-amount" className="block flex-1 border-0 bg-transparent py-1.5 pl-1 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6" placeholder=""/>
              </div>
            </div>
            <label htmlFor="deposit" className="block text-sm font-medium leading-6 text-gray-900">Your Balance : {TokenBalance}</label>
            <button type="button" onClick={e=>depositPool()} className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">Deposit</button>
          </div>
          <div>
            <div className="mt-2">
              <div className="flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600 sm:max-w-md">
                <span className="flex select-none items-center pl-3 text-gray-500 sm:text-sm">Amount</span>
                <input type="number" ref={refWithdrawAmount} name="withdraw-amount" id="withdraw-amount" autoComplete="withdraw-amount" className="block flex-1 border-0 bg-transparent py-1.5 pl-1 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6" placeholder=""/>
              </div>
            </div>
            <label htmlFor="withdraw" className="block text-sm font-medium leading-6 text-gray-900">Your Staked : {TokenStaked}</label>
            <button type="button" onClick={e=>withdrawPool()} disabled={TokenStaked=="0.00"?true:false} className="rounded-md bg-pink-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">Withdraw</button>
          </div>
          <div>
            <div className="mt-2">
            </div>
            <label htmlFor="username" className="block text-sm font-medium leading-6 text-gray-900">Your Reward : {EsReward}</label>
            <button type="button" onClick={e=>claimReward()} className="rounded-md bg-green-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">Claim</button>
          </div>
        </div>
      </>
      ):(
      <><p className='text-4xl' >You have not token</p></>
      )}
        
      </div>
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

function FarmingCard({ account }: { account: PublicKey }) {
  const {
    accountQuery,
    incrementMutation,
    setMutation,
    decrementMutation,
    closeMutation,
  } = useFarmingProgramAccount({ account });

  const count = useMemo(
    () => accountQuery.data?.count ?? 0,
    [accountQuery.data?.count]
  );

  return accountQuery.isLoading ? (
    <span className="loading loading-spinner loading-lg"></span>
  ) : (
    <div className="card card-bordered border-base-300 border-4 text-neutral-content">
      <div className="card-body items-center text-center">
        <div className="space-y-6">
          <h2
            className="card-title justify-center text-3xl cursor-pointer"
            onClick={() => accountQuery.refetch()}
          >
            {count}
          </h2>
          <div className="card-actions justify-around">
            <button
              className="btn btn-xs lg:btn-md btn-outline"
              onClick={() => incrementMutation.mutateAsync()}
              disabled={incrementMutation.isPending}
            >
              Increment
            </button>
            <button
              className="btn btn-xs lg:btn-md btn-outline"
              onClick={() => {
                const value = window.prompt(
                  'Set value to:',
                  count.toString() ?? '0'
                );
                if (
                  !value ||
                  parseInt(value) === count ||
                  isNaN(parseInt(value))
                ) {
                  return;
                }
                return setMutation.mutateAsync(parseInt(value));
              }}
              disabled={setMutation.isPending}
            >
              Set
            </button>
            <button
              className="btn btn-xs lg:btn-md btn-outline"
              onClick={() => decrementMutation.mutateAsync()}
              disabled={decrementMutation.isPending}
            >
              Decrement
            </button>
          </div>
          <div className="text-center space-y-4">
            <p>
              <ExplorerLink
                path={`account/${account}`}
                label={ellipsify(account.toString())}
              />
            </p>
            <button
              className="btn btn-xs btn-secondary btn-outline"
              onClick={() => {
                if (
                  !window.confirm(
                    'Are you sure you want to close this account?'
                  )
                ) {
                  return;
                }
                return closeMutation.mutateAsync();
              }}
              disabled={closeMutation.isPending}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
