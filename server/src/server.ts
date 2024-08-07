import {
    createConnection,
    TextDocuments,
    Diagnostic,
    DiagnosticSeverity,
    ProposedFeatures,
    InitializeParams,
    DidChangeConfigurationNotification,
    CompletionItem,
    CompletionItemKind,
    TextDocumentPositionParams,
    TextDocumentSyncKind,
    InitializeResult
  } from 'vscode-languageserver/node';
  
  import { TextDocument } from 'vscode-languageserver-textdocument';
  
  const connection = createConnection(ProposedFeatures.all);
  const documents: TextDocuments<TextDocument> = new TextDocuments(TextDocument);
  
  let hasConfigurationCapability = false;
  let hasWorkspaceFolderCapability = false;
  let hasDiagnosticRelatedInformationCapability = false;
  
  connection.onInitialize((params: InitializeParams) => {
    const capabilities = params.capabilities;
  
    hasConfigurationCapability = !!(
      capabilities.workspace && !!capabilities.workspace.configuration
    );
    hasWorkspaceFolderCapability = !!(
      capabilities.workspace && !!capabilities.workspace.workspaceFolders
    );
    hasDiagnosticRelatedInformationCapability = !!(
      capabilities.textDocument &&
      capabilities.textDocument.publishDiagnostics &&
      capabilities.textDocument.publishDiagnostics.relatedInformation
    );
  
    const result: InitializeResult = {
      capabilities: {
        textDocumentSync: TextDocumentSyncKind.Incremental,
        completionProvider: {
          resolveProvider: true
        }
      }
    };
    if (hasWorkspaceFolderCapability) {
      result.capabilities.workspace = {
        workspaceFolders: {
          supported: true
        }
      };
    }
    return result;
  });
  
  connection.onInitialized(() => {
    if (hasConfigurationCapability) {
      connection.client.register(DidChangeConfigurationNotification.type, undefined);
    }
    if (hasWorkspaceFolderCapability) {
      connection.workspace.onDidChangeWorkspaceFolders(_event => {
        connection.console.log('Workspace folder change event received.');
      });
    }
  });
  
  connection.onDidChangeWatchedFiles(_change => {
    connection.console.log('We received a file change event');
  });
  
  connection.onCompletion(
    (_textDocumentPosition: TextDocumentPositionParams): CompletionItem[] => {
      return [
        {
          label: 'bead',
          kind: CompletionItemKind.Keyword,
          data: 1
        },
        {
          label: 'enabled',
          kind: CompletionItemKind.Keyword,
          data: 2
        },
        {
          label: 'source',
          kind: CompletionItemKind.Keyword,
          data: 3
        }
      ];
    }
  );
  
  connection.onCompletionResolve(
    (item: CompletionItem): CompletionItem => {
      if (item.data === 1) {
        item.detail = 'Kado bead';
        item.documentation = 'Defines a Kado bead';
      }
      return item;
    }
  );
  
  function validateTmplDocument(textDocument: TextDocument): Diagnostic[] {
    const text = textDocument.getText();
    const pattern = /{{([^}]+)}}/g;
    let match;
    const diagnostics: Diagnostic[] = [];
  
    while ((match = pattern.exec(text)) !== null) {
      const innerContent = match[1].trim();
      if (!innerContent.startsWith('keybase:note:') && !innerContent.startsWith('.Get') && !innerContent.startsWith('.Env')) {
        diagnostics.push({
          severity: DiagnosticSeverity.Warning,
          range: {
            start: textDocument.positionAt(match.index),
            end: textDocument.positionAt(match.index + match[0].length)
          },
          message: `Unrecognized template expression: ${innerContent}`,
          source: 'tmpl'
        });
      }
    }
  
    return diagnostics;
  }
  
  async function validateTextDocument(textDocument: TextDocument): Promise<void> {
    const diagnostics: Diagnostic[] = [];
  
    if (textDocument.languageId === 'tmpl') {
      diagnostics.push(...validateTmplDocument(textDocument));
    } else {
      // Existing validation logic for other file types
      const text = textDocument.getText();
      const pattern = /\b[A-Z]{2,}\b/g;
      let m: RegExpExecArray | null;
  
      while ((m = pattern.exec(text))) {
        const diagnostic: Diagnostic = {
          severity: DiagnosticSeverity.Warning,
          range: {
            start: textDocument.positionAt(m.index),
            end: textDocument.positionAt(m.index + m[0].length)
          },
          message: `${m[0]} is all uppercase.`,
          source: 'ex'
        };
        if (hasDiagnosticRelatedInformationCapability) {
          diagnostic.relatedInformation = [
            {
              location: {
                uri: textDocument.uri,
                range: Object.assign({}, diagnostic.range)
              },
              message: 'Spelling matters'
            }
          ];
        }
        diagnostics.push(diagnostic);
      }
    }
  
    connection.sendDiagnostics({ uri: textDocument.uri, diagnostics });
  }
  
  documents.onDidChangeContent(change => {
    validateTextDocument(change.document);
  });
  
  documents.listen(connection);
  connection.listen();