// const btnPeople = document.querySelector("#btnPeople");
// const tablePeople = document.querySelector(".tabelPeople");

// btnPeople.addEventListener("click", () => {
//   if (tablePeople.style.display == "block") {
//     tablePeople.style.display = "none";
//   } else {
//     tablePeople.style.display = "block";
//   }
// });
$(document).ready(function () {
    $('#myTable').DataTable({
      ajax: {
        url: '/api/getData',
        dataSrc: '',
      },
      columns: [
        { data: 'ID' },
        { data: 'Year_Birth' },
        { data: 'Education' },
      ],
    });
  });
app.get('/api/getData', async (req, res) => {
  try {
    const data = await fetchDataFromDatabase();

    res.json(data);
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).send('Internal Server Error');
  }
});

