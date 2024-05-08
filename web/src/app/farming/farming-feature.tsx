import { useWallet } from '@solana/wallet-adapter-react';
import { WalletButton } from '../solana/solana-provider';
import { AppHero, ellipsify } from '../ui/ui-layout';
import { ExplorerLink } from '../cluster/cluster-ui';
import { useFarmingProgram } from './farming-data-access';
import { FarmingCreate, FarmingList } from './farming-ui';

export default function FarmingFeature() {
  const { publicKey } = useWallet();
  const { programId } = useFarmingProgram();

  return publicKey ? (
    <div>
      <AppHero
        title="Farming"
        subtitle={''}
      >
        {/* <p className="mb-6">
          <ExplorerLink
            path={`account/${programId}`}
            label={ellipsify(programId.toString())}
          />
        </p> */}
        <FarmingCreate />
      </AppHero>
      <FarmingList />
    </div>
  ) : (
    <div className="max-w-4xl mx-auto">
      <div className="hero py-[64px]">
        <div className="hero-content text-center">
          <WalletButton />
        </div>
      </div>
    </div>
  );
}
