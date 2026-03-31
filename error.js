try {
  require('@testing-library/react');
} catch (e) {
  const msg = e.message;
  console.log("MISSING:", msg.split('\n')[0]);
}
