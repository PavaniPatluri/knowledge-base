fetch('http://localhost:3000/documents')
  .then(r => r.json())
  .then(console.log)
  .catch(console.error);
