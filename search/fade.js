// This function only allows the code inside to be triggered when the page is fully loaded.
$(document).ready(function () {
  // Fetch the JSON output.
  fetch(
    'https://raw.githubusercontent.com/calebhyatt/geneva-degree-search/main/degrees.json'
  )
    .then((res) => res.json())
    .then((data) => {
      // Putting all objects at the beginning so that they can be used wherever they are needed.
      const programLegends = {
        'Bachelor of Arts': 'arts',
        'Bachelor of Business Administration': 'business',
        'Bachelor of Education': 'education',
        'Bachelor of Science': 'science',
        'Undergraduate Major': 'undermajor',
        'Undergraduate Minor': 'underminor',
        'Undergraduate Concentration': 'underconc',
        'Graduate Program': 'graduate',
        'Online Degree Completion': 'online',
        'Early College': 'early',
        Certificate: 'certificate',
      }

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

      // "Copy to URL" button
      $('.wide-container').append(`
        <button onclick="copyURI()">Copy URL</button>
      `)

      // Call each function when the page loads to initialize everything.
      urlToSearch()
      init()

      // Trigger the search function every time an input is changed.
      $('#filter-keyword').on('keyup', function () {
        search()
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
        // Creates the header that says "No Results Found" and then fades it out of view.
        $('#results').append(`
          <div class="nothing-found">
            <h1>No Results Found</h1>
          </div>
        `)
        $('#results .nothing-found').fadeOut(0)

        /*
          Loops through each entry in the JSON fetched and creates a card
          for each one, adding in all the necessary data.
        */
        for (let i = 0; i < data.length; i++) {
          let j = data[i]
          $('#results').append(`
            <div class="card flex-item" id="${j.title
              .toLowerCase()
              .replaceAll(' ', '_')}">
              <div class="card-info">
                <a href="${j.link}">
                  <img
                    alt="${j.title}"
                    class="u-full-width"
                    src="https://www.geneva.edu/academics/programs/_images/program-img-aviation.jpg"
                  />
                </a>
                <h2>${j.title}</h2>
                <p class="descriptors"><span class="ico-circ">${j.degree_code[0].toUpperCase()}</span><span class="card-tag">${j.program_info.join(
            ' &#x2022; '
          )}</span></p>
              </div>
            </div>
          `)
        }

        search()
      }

      /*
        The variable that will be used when published to the college website.
        https://geneva.edu${j.image}
      */

      function search() {
        // Initialize empty arrays for data later.
        var values = [],
          res = []

        values.push($('#filter-keyword').val().toLowerCase())
        values.push($('#filter-interest option:selected').val())
        values.push($('#filter-program option:selected').val())

        // If the inputs are empty, show everything.
        if (values[0] == '' && values[1] == '' && values[2] == '')
          resetResults()

        var fadeOut = [],
          fadeIn = []
        // Looping through each entry in the array grabbed from the JSON.
        for (let i = 0; i < data.length; i++) {
          // Checking is keywords match up.
          var keywordIncluded = false
          for (let j = 0; j < data[i].keywords.length; j++) {
            if (data[i].keywords[j].includes(values[0])) keywordIncluded = true
          }

          // Checking if the search bar and dropdowns match any entries.
          var title = data[i].title.toLowerCase()

          if (
            (title.includes(values[0]) || keywordIncluded) &&
            (data[i].interest_types.includes(values[1]) || values[1] == '') &&
            (data[i].program_info.includes(programLegends[values[2]]) ||
              values[2] == '')
          ) {
            res.push(data[i])
            fadeIn.push(
              `#results #${data[i].title.toLowerCase().replaceAll(' ', '_')}`
            )
          } else {
            fadeOut.push(
              `#results #${data[i].title.toLowerCase().replaceAll(' ', '_')}`
            )
          }
        }

        // Fade in what needs to be faded in and fade out what needs to be faded out.
        for (let i = 0; i < fadeOut.length; i++) $(fadeOut[i]).fadeOut(200)
        for (let i = 0; i < fadeIn.length; i++) $(fadeIn[i]).fadeIn(200)

        // If there's nothing to fade in or fade out, fade in "Nothing Found"
        if (fadeOut.length !== 0 && fadeIn.length !== 0)
          $('#results .nothing-found').fadeOut(200)
        else if (fadeIn.length === 0)
          setTimeout(() => {
            $('#results .nothing-found').fadeIn(200)
          }, 200)

        /*
          If the number of results is not evenly divisible by 4 (the max number
          that fit in the width) then add in empty cards so that everything is
          formatted correctly.
        */
        if (res.length % 4 != 0) {
          let blanks = 4 - Math.floor(res.length / 4)

          for (let k = 0; k < blanks; k++) {
            $('#results').append(`<div class="card-blank flex-item"></div>`)
          }
        }

        // A function for resetting the results shown.
        function resetResults() {
          $('#results .nothing-found').fadeOut(200)
          setTimeout(() => {
            // Remove blank cards.
            $('#results .card-blank').remove()
            $('#results .card').fadeIn(200)
          }, 200)
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

  // Update the website URL here. It is site specific.
  var siteURL = '127.0.0.1:5500?'
  function copyURI() {
    var url = `${siteURL}?`
    var hashes = []

    if ($('#filter-keyword').val())
      hashes.push(`keyword=${$('#filter-keyword').val()}`)

    if (interestLegends[$('#filter-interest').val()])
      hashes.push(`interest=${interestLegends[$('#filter-interest').val()]}`)

    if (programLegends[$('#filter-degree').val()])
      hashes.push(`program=${programLegends[$('#filter-degree').val()]}`)

    navigator.clipboard.writeText(`${url}${hashes.join('&')}`)
    alert('URL copied!')
  }
})
