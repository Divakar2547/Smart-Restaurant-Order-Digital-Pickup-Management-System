import { getStatusBadgeClass } from '../../utils/helpers';

const StatusBadge = ({ status }) => (
  <span className={getStatusBadgeClass(status)}>
    {status?.charAt(0).toUpperCase() + status?.slice(1)}
  </span>
);

export default StatusBadge;
