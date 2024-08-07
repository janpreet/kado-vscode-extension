import * as path from 'path';
import { runTests } from 'vscode-test';

async function main() {
  try {
    const extensionDevelopmentPath = path.resolve(__dirname, '../../..');
    console.log('Extension Development Path:', extensionDevelopmentPath);

    const extensionTestsPath = path.resolve(__dirname, './suite/index');
    console.log('Extension Tests Path:', extensionTestsPath);

    const testWorkspace = path.resolve(__dirname, '../../test-workspace');
    console.log('Test Workspace Path:', testWorkspace);

    const launchArgs = [
      testWorkspace,
      '--disable-extensions',
      '--extensionDevelopmentPath=' + extensionDevelopmentPath
    ];

    console.log('Launch Args:', launchArgs);

    const exitCode = await runTests({
      extensionDevelopmentPath,
      extensionTestsPath,
      launchArgs
    });

    console.log('Test run exit code:', exitCode);

    if (exitCode !== 0) {
      console.error(`Tests failed with exit code ${exitCode}`);
      process.exit(1);
    }
  } catch (err) {
    console.error('Failed to run tests:', err);
    process.exit(1);
  }
}

main();