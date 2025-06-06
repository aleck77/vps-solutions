import type { VPSPlan } from '@/types';

export const mockVpsPlans: VPSPlan[] = [
  {
    id: 'starter',
    name: 'Starter VPS',
    cpu: '1 vCPU',
    ram: '2GB RAM',
    storage: '50GB SSD',
    bandwidth: '1TB Bandwidth',
    priceMonthly: 10,
    features: ['Free SSL Certificate', 'Daily Backups', '24/7 Support'],
  },
  {
    id: 'growth',
    name: 'Growth VPS',
    cpu: '2 vCPU',
    ram: '4GB RAM',
    storage: '100GB SSD',
    bandwidth: '2TB Bandwidth',
    priceMonthly: 20,
    features: ['Free SSL Certificate', 'Daily Backups', '24/7 Support', 'Priority Support'],
  },
  {
    id: 'pro',
    name: 'Pro VPS',
    cpu: '4 vCPU',
    ram: '8GB RAM',
    storage: '200GB SSD',
    bandwidth: '5TB Bandwidth',
    priceMonthly: 40,
    features: ['Free SSL Certificate', 'Daily Backups', '24/7 Support', 'Dedicated IP', 'Advanced DDoS Protection'],
  },
];
