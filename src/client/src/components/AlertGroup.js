import React from 'react';
import { useSelector } from 'react-redux';

import Alert from './Alert';
import { alertsSelector } from '../store/selectors';

function AlertGroup() {
  const alerts = useSelector(alertsSelector);

  return(
    alerts.map(alert =>
      <Alert
        message={alert.message}
        id={alert.id}
        key={alert.id}
        type={alert.type}
      />
    )
  );
}

export default AlertGroup;
