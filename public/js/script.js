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
        url: '/api/getData', // Replace with your API endpoint to fetch data
        dataSrc: '', // This is required to correctly parse the JSON data
      },
      columns: [
        { data: 'ID' },
        { data: 'Year_Birth' },
        { data: 'Education' },
        // Add more columns as needed
      ],
    });
  });// Add this route to your server file (e.g., app.js or index.js)
app.get('/api/getData', async (req, res) => {
  try {
    // Fetch data from your database
    const data = await fetchDataFromDatabase();

    // Send the data as JSON
    res.json(data);
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).send('Internal Server Error');
  }
});

