/* eslint-disable */
const fs = require('fs');

function updateModel(path, oldText, newText) {
  let content = fs.readFileSync(path, 'utf8');
  if (!content.includes(newText)) {
    content = content.replace(oldText, oldText + '\n' + newText);
    fs.writeFileSync(path, content);
  }
}

updateModel('src/models/Participant.ts', "const ParticipantSchema = new mongoose.Schema({", "const ParticipantSchema = new mongoose.Schema({\n// @ts-ignore - for finding easily\n");

console.log('done');
