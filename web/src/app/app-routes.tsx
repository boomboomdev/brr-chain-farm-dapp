import { lazy } from 'react';
import { Navigate, RouteObject, useRoutes } from 'react-router-dom';
import { UiLayout } from './ui/ui-layout';

const AccountListFeature = lazy(() => import('./account/account-list-feature'));
const AccountDetailFeature = lazy(
  () => import('./account/account-detail-feature')
);
const ClusterFeature = lazy(() => import('./cluster/cluster-feature'));
const DashboardFeature = lazy(() => import('./dashboard/dashboard-feature'));

const FarmingFeature = lazy(() => import('./farming/farming-feature'));
const links: { label: string; path: string }[] = [
  { label: 'Account', path: '/account' },
  { label: 'Clusters', path: '/clusters' },
  { label: 'Farming Program', path: '/farming' },
];

const routes: RouteObject[] = [
  { path: '/account/', element: <AccountListFeature /> },
  { path: '/account/:address', element: <AccountDetailFeature /> },
  { path: '/clusters', element: <ClusterFeature /> },
  { path: 'farming/*', element: <FarmingFeature /> },
];

export function AppRoutes() {
  return (
    <UiLayout links={links}>
      {useRoutes([
        { index: true, element: <Navigate to={'/dashboard'} replace={true} /> },
        { path: '/dashboard', element: <DashboardFeature /> },
        ...routes,
        { path: '*', element: <Navigate to={'/dashboard'} replace={true} /> },
      ])}
    </UiLayout>
  );
}
