import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf8');

const iotView = `
          {/* IoT View */}
          {activeTab === 'iot' && (
            <IoTEditor />
          )}
`;

content = content.replace("{/* Analytics View */}", iotView + "\n          {/* Analytics View */}");

fs.writeFileSync('src/App.tsx', content);
console.log('App.tsx patched successfully');
