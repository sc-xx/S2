import React from 'react';
import ReactDOM from 'react-dom';
import { SheetComponent } from '@antv/s2-react';
import '@antv/s2-react/dist/style.min.css';

fetch(
  'https://gw.alipayobjects.com/os/bmw-prod/2a5dbbc8-d0a7-4d02-b7c9-34f6ca63cff6.json',
)
  .then((res) => res.json())
  .then((dataCfg) => {
    const s2Options = {
      width: 600,
      height: 480,
      pagination: {
        pageSize: 4,
        current: 1,
      },
    };

    ReactDOM.render(
      <SheetComponent
        dataCfg={dataCfg}
        options={s2Options}
        showPagination={true}
      />,
      document.getElementById('container'),
    );
  });
