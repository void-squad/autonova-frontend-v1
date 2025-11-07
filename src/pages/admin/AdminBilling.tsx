import { BillingOperationsView } from '../employee/EmployeeBilling';

const AdminBilling = () => (
  <BillingOperationsView
    title="Billing oversight"
    description="Monitor every customer invoice, resolve disputes, and record offline settlements."
    defaultStatus="ALL"
  />
);

export default AdminBilling;
