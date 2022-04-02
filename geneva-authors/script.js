$(document).ready(function () {
  $.getJSON("./data.json", function (initialData) {
    $("#filter-keyword").on("keyup", function () {
      if (
        $("#filter-keyword").val().length === 0 ||
        $("#filter-keyword").val().length >= 3
      ) {
        paginateResults();
      }
    });
    $("#filter-year").on("change", function () {
      paginateResults();
    });
    $("#maxRows").on("change", function () {
      paginateResults();
    });

    paginateResults();

    function paginateResults() {
      $("#results tbody").html();
      $("#results tbody").children().remove();

      var trNum = 0;
      var maxRows = parseInt($("#maxRows").val());
      var totalRows = initialData.length;

      let values = [];
      values.push($("#filter-keyword").val());
      values.push($("#filter-year").val());

      let author,
        count = 0;
      for (const i in initialData) {
        author = initialData[i];

        console.log(author);
        console.log(values[0]);

        if (
          author["Title"].includes(values[0]) ||
          author["First_Name"].includes(values[0]) ||
          author["Last_Name"].includes(values[0]) ||
          author["Publisher"].includes(values[0]) ||
          (Number(author["First_Name"]) >= values[1] &&
            Number(author["First_Name"]) <= values[1] + 9)
        ) {
          count++;

          $("#results tbody").append(`
          <tr>
            <td>${highlight(author["First_Name"])} ${highlight(
            author["Last_Name"]
          )}</td>
            <td class="tr-odd">${highlight(author["Title"])}</td>
            <td>${highlight(author["Publisher"])}</td>
            <td class="tr-odd">${highlight(author["Publish_Date"])}</td>
          </tr>
        `);
        }

        $("#count").html(`Count: ${count}`);

        function highlight(inputText) {
          inputText = String(inputText);
          var index = inputText.indexOf(values[0]);

          if (index >= 0) {
            inputText =
              inputText.substring(0, index) +
              "<span class='highlight'>" +
              inputText +
              "</span>";
          }

          return inputText;
        }
      }
    }

    // The function that parses the URL into the search bar.
    function urlToSearch() {
      /*
        This function is only used inside of the 'urlToSearch' function, and
        flips the provided JSON object's keys and values so that it can be
        used properly.

        If it's needed outside of the 'urlToSearch' function, we can move it.
      */
      function reverseObject(initialObject) {
        // 'reversedObject' will be the reversed JSON object we return at the end of the function.
        var reversedObject = {};

        /*
          Filters through each key, double checks to make sure the JSON object
          has a corresponding value, and puts both the key and value into the
          new object.
        */
        for (var prop in initialObject) {
          if (initialObject.hasOwnProperty(prop)) {
            reversedObject[initialObject[prop]] = prop;
          }
        }

        return reversedObject;
      }

      // This will have a list of each hash in the URL.
      let values = {};

      // This parses out the hashes from the URL so that we can use them.
      let hashes = window.location.href
        .slice(window.location.href.indexOf("?") + 1)
        .split("&");

      // This loops through the hashes we now have and puts them into the 'values' array.
      let hash;
      for (let i = 0; i < hashes.length; i++) {
        hash = hashes[i].split("=");
        values[hash[0]] = hash[1];
      }

      // And last but not least, we apply each hash into the search bar and dropdowns.
      if (values["keyword"])
        $("#filter-keyword").val(decodeURIComponent(values["keyword"]));
      // if (values["program"])
      //   $("#filter-program")
      //     .val(reverseObject(interestLegends)[values["program"]])
      //     .change();
      if (values["year"])
        $("#filter-year").val(interesLegends(values["year"])).change();
    }
  });
});
