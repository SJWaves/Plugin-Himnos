import { createBrowserRouter } from 'react-router';
import ControlPage from './control/page';
import DisplayPage from './display/page';
import ProjectionPage from './projection/page';
import HomePage from './home/page';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: HomePage,
  },
  {
    path: '/control',
    Component: ControlPage,
  },
  {
    path: '/display',
    Component: DisplayPage,
  },
  {
    path: '/projection',
    Component: ProjectionPage,
  },
], {
  basename: import.meta.env.BASE_URL,
});
