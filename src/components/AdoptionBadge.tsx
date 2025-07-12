import { AdoptionStatus } from '../types';

interface AdoptionBadgeProps {
  status: AdoptionStatus;
}

export function AdoptionBadge({ status }: AdoptionBadgeProps) {
  const getStatusStyles = (status: AdoptionStatus) => {
    switch (status) {
      case "全社導入":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "一部導入":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "導入してない":
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
    }
  };

  return (
    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusStyles(status)}`}>
      {status}
    </span>
  );
}