/*
    KEEP THIS COMMENT HERE
    Hardlink for JSON: https://www.geneva.edu/academics/programs/json/programs
    Local Link: ./degrees.json
*/

// This function only allows the code inside to be triggered when the page is fully loaded.
$(document).ready(function () {
  // Fetch the JSON output.
  fetch('https://www.geneva.edu/academics/programs/json/programs')
    .then((res) => res.json())
    .then((data) => {
      // Putting all objects at the beginning so that they can be used wherever they are needed.
      const interestLegends = {
        'Arts, Design & Communication': 'arts',
        'Biblical Studies, Philosophy & Ministry': 'ministry',
        'Business & Sport Management': 'business',
        'Computer Science & Technology': 'compsci',
        'Education & Teaching': 'education',
        'Nursing, Healthcare & Life Sciences': 'health',
        'Political Science, History & Languages': 'polisci',
        'Psychology & Social Services': 'psych',
        'Science, Engineering & Mathematics': 'stem',
      }

      // Call each function when the page loads to initialize everything.
      urlToSearch()
      init()
      search()

      // Trigger the search function every time an input is changed.
      $('#filter-keyword').on('keyup', function () {
        if ($('#filter-keyword').val().length !== 1) {
          search()
        }
      })

      $('#filter-interest').change(function () {
        search()
      })

      $('#filter-program').change(function () {
        search()
      })

      // Functions
      /*
        This sets the plate to either show all results (if there are
        no hashes in the URL) or shows the results for the hashes in the URL.
      */
      function init() {
        /*
          Loops through each entry in the JSON fetched and creates a card
          for each one, adding in all the necessary data.
        */
        for (let i = 0; i < data.length; i++) addResult(data[i], data)

        // Creates a region that says "No Results Found" and then fades it out of view.
        $('#results').append(`
          <div class="nothing-found">
            <h1>No Results Found</h1>
          </div>
        `)
        $('#results .nothing-found').fadeOut(0)
      }

      /*
        The variable that will be used when published to the college website.
        https://geneva.edu${j.image}
      */

      function search() {
        // Initialize empty arrays for data later.
        var values = []

        values.push($('#filter-keyword').val().toLowerCase())
        values.push($('#filter-interest option:selected').val())
        values.push($('#filter-program option:selected').val())

        // If the inputs are empty, show everything.
        if (values[0] == '' && values[1] == '' && values[2] == '')
          addResult([], [])

        var res = []
        // Looping through each entry in the array grabbed from the JSON.
        for (let i = 0; i < data.length; i++) {
          // Checking is keywords match up.
          var keywordIncluded = false
          for (let j = 0; j < data[i].keywords.length; j++)
            if (data[i].keywords[j].includes(values[0])) keywordIncluded = true

          // Checking if the search bar and dropdowns match any entries.
          var title = data[i].title.toLowerCase()

          if (
            (title.includes(values[0]) || keywordIncluded) &&
            (data[i].interest_types.includes(values[1]) || values[1] == '') &&
            (data[i].program_info.includes(values[2]) || values[2] == '')
          )
            res.push(data[i])
        }

        // Fade in what needs to be faded in and fade out what needs to be faded out.
        $('.card').remove()
        for (let i = 0; i < res.length; i++) addResult(res[i], res)

        // If there's nothing to fade in or fade out, fade in "Nothing Found"
        if (res.length > 0) $('#results .nothing-found').fadeOut(0)
        else if (res.length === 0) $('#results .nothing-found').fadeIn(0)

        // A function for resetting the results shown.
        // function resetResults() {
        //   // Remove blank cards.
        //   $('#results .nothing-found').remove()
        //   $('#results .card-blank').remove()
        //   $('#results .card').remove()
        //   init()
        // }
      }

      function addResult(data, res) {
        if (res.length === 0) {
          $('.card').remove()
          $('.nothing-found').fadeIn(0)
        } else {
          $('#results').append(`
            <div class="card flex-item" id="${data.title
              .toLowerCase()
              .replaceAll(' ', '_')}">
              <div class="card-info">
                <a href="${data.link}">
                  <img
                    alt="${data.title}"
                    class="u-full-width"
                    src="${data.image}"
                    loading="lazy"
                  />
                  <h2>${data.title}</h2>
                <p class="descriptors">${degreeCode(
                  data.degree_code
                )}<span class="card-tag">${data.program_info.join(
            ' &#x2022; '
          )}</span></p>
                </a>
              </div>
            </div>
          `)

          addBlanks(res)
        }
      }

      function degreeCode(codes) {
        let endList = []

        codes.forEach((code) =>
          endList.push(`<span class="ico-circ">${code}</span>`)
        )

        return endList.join('')
      }

      function addBlanks(res) {
        $('.card-blank').remove()

        if (res.length < 3) {
          let blanks = 3 - res.length

          for (let k = 0; k < blanks; k++) {
            $('#results').append(`<div class="card-blank flex-item"></div>`)
          }
        }

        if (res.length % 3 != 0) {
          let blanks = Math.floor(res.length / 3)

          for (let k = 0; k < blanks; k++) {
            $('#results').append(`<div class="card-blank flex-item"></div>`)
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
        function reverseObject(data) {
          // 'newObj' will be the reversed JSON object we return at the end of the function.
          var newObj = {}

          /*
            Filters through each key, double checks to make sure the JSON object
            has a corresponding value, and puts both the key and value into the
            new object.
          */
          for (var prop in data) {
            if (data.hasOwnProperty(prop)) {
              newObj[data[prop]] = prop
            }
          }

          return newObj
        }

        // This will have a list of each hash in the URL.
        let vars = []

        // This parses out the hashes from the URL so that we can use them.
        let hashes = window.location.href
          .slice(window.location.href.indexOf('?') + 1)
          .split('&')

        // This loops through the hashes we now have and puts them into the 'vars' array.
        let hash
        for (let i = 0; i < hashes.length; i++) {
          hash = hashes[i].split('=')
          vars.push(hash[0])
          vars[hash[0]] = hash[1]
        }

        // And last but not least, we apply each hash into the search bar and dropdowns.
        if (vars['keyword'])
          $('#filter-keyword').val(decodeURIComponent(vars['keyword']))
        if (vars['interest'])
          $('#filter-interest')
            .val(reverseObject(interestLegends)[vars['interest']])
            .change()
        // if (vars['degree']) $('#filter-degree').val(vars['degree']).change()
        if (vars['program']) $('#filter-program').val(vars['program']).change()
      }
    })
})
