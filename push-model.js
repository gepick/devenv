const axios = require('axios')
const prompt = require('prompt')
const exec = require('child_process').exec

const args = process.argv.slice(2)
const modelDir = args[0]

var prompt_attributes = [
    {
        name: 'username',
        validator: /^[a-zA-Z\s\-]+$/,
        warning: 'Username is not valid, it can only contains letters, spaces, or dashes'
    },
    {
        name: 'password',
        hidden: true
    }
]

prompt.start();

const host = 'http://bb864.l.dedikuoti.lt:3005/'

const FormData = require('form-data');
const fs = require('fs');

const sendFile = () => {
  const filePath = __dirname + '/test.txt';
  fs.readFile(filePath, (err, imageData) => {
    if (err) {
      throw err;
    }
    const form = new FormData();
    form.append('file', imageData, {
      filepath: filePath,
      contentType: 'image/jpeg',
    });

    axios.post('http://localhost:3005/file', form, {
      headers: form.getHeaders(),
    }).then(response => {
      console.log('success! ', response.status, response.statusText, response.headers, typeof response.data, Object.prototype.toString.apply(response.data));
    }).catch(err => {
      console.log(err);
    });
  });
}

const sendFile2 = (filePath, username, password) => {

  if(filePath[0] === '.'){
    filePath = filePath.substr(1)
  }

  var request = require('request');
  var path = require('path');
  var fs = require('fs');

  var filename =  __dirname + filePath;

  var target = host+'upload/'+username+'/'+password

  var rs = fs.createReadStream(filename);
  var ws = request.post(target);

  ws.on('drain', function () {
    console.log('drain', new Date());
    rs.resume();
  });

  rs.on('end', function () {
    console.log('uploaded to ' + target);
  });

  ws.on('error', function (err) {
    console.error('cannot send file to ' + target + ': ' + err);
  });

  rs.pipe(ws);
}

const loadModelInfo = (modelDir) => {
  const info = JSON.parse(fs.readFileSync(modelDir+'/build/model-info.json', 'utf8'))
  return info
}

const zipModel = (fileName, dir) => {
  return new Promise((resolve, reject) => {
    const command = 'cd '+dir+'/build && tar -zcvf ../'+fileName+'.tar.gz .'

    console.log(command)

    const res = exec(command, (err, stdout, stderr ) => {
      if(err)console.log(err)
      console.log(stdout)
      resolve()
    })
  })
}

prompt.get(prompt_attributes, function (err, result) {
    if (err) {
        console.log(err);
        return 1;
    }else {
        console.log('Command-line received data:');
        const username = result.username
        const password = result.password

        const config = {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
        
        const reqBody =  {
          username: username,
          password: password
        }

        axios.post(host+'login2', reqBody).then(response => {
          console.log(response.data);
          
          const { uniquieModelId } = loadModelInfo(modelDir)
          zipModel(uniquieModelId, modelDir).then(()=>{
            const modelZipPath = modelDir+'/'+uniquieModelId+'.tar.gz'
            sendFile2(modelZipPath, username, password)
          })


        }).catch(error => {
          console.log(error);
        })
    }
});
