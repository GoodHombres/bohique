var express = require('express');
var router = express.Router();
var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');

// Outputs folder
const outputFolder = 'public/outputs';

// Regex patterns
const patterns = {
  pdf: /\.pdf$/g,
};

// Contains urls
const urls = {
  senateProjects: 'http://senado.pr.gov/Proyectos%20del%20Senado%2020172020/Forms/AllItems.aspx?View=%7b26BB2A55%2dA6F0%2d4F5B%2dBA00%2d468F8A7FE16E%7d&FolderCTID=0x012001&GroupString=%253b%2523Proyecto%2520del%2520Senado%253b%2523&DrillDown=1',
};

/* GET index */
router.get('/', function(req, res, next) {
  // Scrape all senate projects
  scrape(urls.senateProjects, getAllSenateProjectLinks);

  res.render('index', { title: 'Bohique', description: 'Recibe los mandamientos de los dioses.' });
});

/**
 * scrape - requests html from a url and dispatches call back
 * @param {string} url 
 * @param {func} callback 
 */
function scrape(url, callback) {
  // Request url
  request(url, function(error, response, html) {
    // If error
    if (error) {
      // Output error
      console.error(error);
    } else {
      // Otherwise dispatch callback function
      callback(html);
    }
  });
}

/**
 * getAllSenateProjectLinks - Finds project links in html and creates output file
 * @param {string} html 
 */
function getAllSenateProjectLinks(html) {
  // Use cheerio to load the html in a traversible way
  var $ = cheerio.load(html);

  // Output file
  const outputFile = `${outputFolder}/senate-projects-output.json`;

  // JSON which will be written in output file
  const json = {
    title: 'Proyectos del Senado',
    links: [],
    lastUpdated: new Date(),
  };

  /*
   * Format:
   * <td class='ms-vb'>
   *  <a />
   * </td>
   */
  // Loop through the project links
  $('.ms-vb a').each(function(i, link) {

    // If href of link is a pdf file
    if (patterns.pdf.test(link.attribs.href)) {

      // Push to our links array
      json.links.push(link.attribs.href);
    }
  });

  // Write file
  fs.writeFile(outputFile, JSON.stringify(json, null, 4), function(err) {
    if (err) {
      console.error(err);
    } else {
      console.log(`File: ${outputFile} has been successfully written!`);
    }
  });
}

module.exports = router;
