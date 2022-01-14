import { lazy } from 'react';
import App from '../App';

export const routesConfig = [
  {
    path: '',
    component: lazy(() => import('../App')),
  },
];

export default routesConfig;
