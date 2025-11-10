import { createBrowserRouter, createRoutesFromElements, Route } from 'react-router-dom';
import AppLayout from './layouts/AppLayout';
import Dashboard from './pages/Dashboard';
import Activity from './pages/Activity';
import Ask from './pages/Ask';
import NotFound from './pages/NotFound';

export const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<AppLayout />}>
      <Route index element={<Dashboard />} />
      <Route path="activity" element={<Activity />} />
      <Route path="ask" element={<Ask />} />
      <Route path="*" element={<NotFound />} />
    </Route>
  )
);
