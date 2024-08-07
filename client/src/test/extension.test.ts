import * as assert from 'assert';
import * as vscode from 'vscode';

suite('Extension Test Suite', () => {
  vscode.window.showInformationMessage('Start all tests.');

  test('Sample test', () => {
    assert.strictEqual(-1, [1, 2, 3].indexOf(5));
    assert.strictEqual(-1, [1, 2, 3].indexOf(0));
  });

  const extensionId = 'janpreet.kado-extension';

  test('Extension should be present', () => {
    const extension = vscode.extensions.getExtension(extensionId);
    console.log('All extensions:', vscode.extensions.all.map(ext => ext.id));
    console.log('Looking for extension:', extensionId);
    console.log('Extension found:', extension ? 'Yes' : 'No');
    assert.ok(extension, 'Extension not found');
  });
  
  test('Should activate', async () => {
    const extension = vscode.extensions.getExtension(extensionId);
    assert.ok(extension, 'Extension not found');
    await extension?.activate();
    assert.strictEqual(extension?.isActive, true, 'Extension did not activate');
  });
});