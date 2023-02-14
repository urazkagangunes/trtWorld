import fetch from "node-fetch";
import http from "http";

async function foo(url, lang) {
  // In this example, we are using the fetch API to make a GET request to a URL.
  let obj;
  const res = await fetch(url);
  obj = await res.json();
  collectData(obj, lang);
}

async function collectData(obj, lang) { 
  let result = [];
  for (var i in obj) result.push([i, obj[i]]);
  
  var holder = [];
  let size = result.length;
  
  for (let i = 0; i < size; i++) {
    // We are going to loop through the result array.
    if (result[i][0] != "metadata") {
      // We are not interested in the metadata.
      let arr = [result[i][0], []];
      for (let j = 0; j < result[i][1].length; j++) {
        let tags = dataCombining(result[i][1][j], lang); // We are send the result to the function dataCombining.
        arr[1].push(tags);
      }
      holder = holder.concat(arr[1]); // concat the array of arrays

      continue;
    }
  }
  postData(holder);
}

function postData(holder) {
  // This function is used to post the data to the database.
  var postData = JSON.stringify(holder);
  var options = {
    hostname: "example.com",
    port: 443,
    path: "/example",
    method: "POST",
    headers: {},
  };
  var req = http.request(options, (res) => {
    console.log("statusCode:", res.statusCode); // Print the response status code.
    console.log("headers:", res.headers);

    res.on("data", (d) => {
      process.stdout.write(d);
    });
  });

  req.on("error", (e) => {
    // Handle errors.
    console.error(e);
  });

  req.write(postData);
  req.end();
}

function dataCombining(objArray, lang) {
  // This function is used to combine the tags into a single array.
  let id = objArray.id;
  let type = objArray.type;
  let title = objArray.title;
  let description = objArray.description;
  let path = objArray.path;
  let publishedDate = objArray.publishedDate;

  let tags = [];
  if (objArray.hasOwnProperty("authors")) {
    // If the array has the authors property.
    let authorInfoSize = objArray.authors.length;
    let authorArr = [];
    if (authorInfoSize > 0) {
      for (let i = 0; i < authorInfoSize; i++) {
        let name = objArray.authors[i].firstName;
        let lastName = objArray.authors[i].lastName;
        let mainImage = objArray.authors[i].mainImage;
        authorArr.push(i, [name, lastName, mainImage]);
      }
    }
    tags = [
      lang,
      {
        // We are going to combine the fields into a single array. (if it has the authors property)
        id: id,
        type: type,
        title: title,
        description: description,
        path: path,
        publishedDate: publishedDate,
        authors: authorArr,
      },
    ];
  } else {
    tags = [
      {
        // If the array does not have the authors property.

        id: id,
        type: type,
        title: title,
        description: description,
        path: path,
        publishedDate: publishedDate,
      },
    ];
  }
  return tags; // Return the combined array.
}

for (let i = 0; i < 1; i++) {
  // We are going to loop through the languages.
  foo("https://www.trtfrancais.com/api/homepage", "fr");
  foo("https://www.trtarabi.com/api/homepage", "ara");
  foo("https://bhsc.trtbalkan.com/api/homepage", "bh");
  foo("https://albanian.trtbalkan.com/api/homepage", "sqi");
  foo("https://macedonian.trtbalkan.com/api/homepage", "mkd");
  foo("https://www.trtrussian.com/api/homepage", "rus");
  foo("https://www.trtdeutsch.com/api/homepage", "deu");
}
