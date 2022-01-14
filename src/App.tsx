import React, { useState } from 'react';
import './App.css';
import { getData } from './test';

console.log(getData);

function App(): any {
  console.log(getData());
  const [count] = useState(0);

  return (
    <div>
      {count}
      <div>a</div>
    </div>
  );
}

export default App;
