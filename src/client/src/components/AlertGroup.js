import React from 'react';
import { useSelector } from 'react-redux';

import Alert from './Alert';
import { alertsSelector } from '../store/selectors';

function AlertGroup() {
  const alerts = useSelector(alertsSelector);

  return(
    <div style={{ position: 'relative' }}>
      <div style={{ position: 'absolute', top: '0', right: '0' }}>
        {
          alerts.map(alert =>
            <Alert
              message={alert.message}
              id={alert.id}
              key={alert.id}
              type={alert.type}
            />
          )
        }
      </div>
    </div>
  );
}

export default AlertGroup;
