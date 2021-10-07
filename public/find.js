var deleteBtn = document.querySelectorAll('.deleteButton');
console.log(deleteBtn)

for (const button of deleteBtn) {
  button.addEventListener('click', (e) => {
    console.log(e.target.dataset);
    fetch(`/find`, {
      method: 'delete',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        topic: e.target.dataset.topic,
        native: e.target.dataset.native,
        roomId: e.target.dataset.roomId,
      }),
    })
      .then((res) => {
        if (res.ok) return res.json();
      })
      .then(() => {
        window.location.reload();
      });
  });
}