function onOpen(event) {
  const menu = FormApp.getUi().createAddonMenu();
  menu.addItem('Configurar tratamento de duplicadas', 'runApplication');
  menu.addItem('Verificar duplicadas', 'verifyDuplicates');
  menu.addToUi();
}

function onInstall(event) {
  onOpen(event);
}

function runApplication() {
  try {
    const htmlPage = HtmlService.createHtmlOutputFromFile('interface');
    const properties = PropertiesService.getDocumentProperties();
    const keys = properties.getKeys();
    if (!keys.includes('validationField')) {
      properties.setProperty('validationField', '');
    }
    if (!keys.includes('messageToUser')) {
      properties.setProperty('messageToUser', '');
    }
    if (!keys.includes('validationMethod')) {
      properties.setProperty('validationMethod', '');
    }
    FormApp.getUi().showModalDialog(htmlPage, 'Gerenciador de duplicadas');
  }
  catch(exception) {
    Logger.log(exception);
  }
}

function saveConfiguration(configuration) {
  try {
    const properties = PropertiesService.getDocumentProperties();
    properties.setProperties({
      validationField : configuration['validationField'],
      messageToUser : configuration['messageToUser'],
      validationMethod : configuration['validationMethod']
    });
  }
  catch(exception) {
    Logger.log(exception);
  }
}

function getConfiguration() {
  try {
    const properties = PropertiesService.getDocumentProperties();
    return {
      validationField : properties.getProperty('validationField'),
      messageToUser : properties.getProperty('messageToUser'),
      validationMethod : properties.getProperty('validationMethod')
    };
  }
  catch(exception) {
    Logger.log(exception);
  }
}

function getFormFields() {
  try {
    const fields = FormApp.getActiveForm().getItems();
    const fieldNames = [];
    for (const field of fields) {
      fieldNames.push(field.getTitle());
    }
    return fieldNames;
  }
  catch(exception) {
    Logger.log(exception);
  }
}

function verifyDuplicates() {
  const htmlPage = HtmlService.createHtmlOutputFromFile('duplicates');
  FormApp.getUi().showModalDialog(htmlPage, 'Verificar duplicadas');
}

function loadDuplicates() {
  try {
    const form = FormApp.getActiveForm();
    const properties = PropertiesService.getDocumentProperties();
    const selectedValidationField = properties.getProperty('validationField');
    const validationMethod = properties.getProperty('validationMethod');
    const validationField = form.getItems().find(item => item.getTitle() === selectedValidationField);
    const responses = form.getResponses().map(response => response.getResponseForItem(validationField).getResponse());
    const responsesByValue = {};
    const duplicates = [];
    if (validationMethod === 'case-sensitive') {
      responses.map(response => {
        if (response in responsesByValue) {
          responsesByValue[response] += 1;
        }
        else {
          responsesByValue[response] = 1;
        }
      });
    }
    else {
      responses.map(response => {
        const lower = response.toLowerCase();
        if (lower in responsesByValue) {
          responsesByValue[lower] += 1;
        }
        else {
          responsesByValue[lower] = 1;
        }
      });
    }
    for (const response in responsesByValue) {
      if (responsesByValue[response] > 1) {
        duplicates.push(response);
      }
    }
    return duplicates;
  }
  catch(exception) {
    Logger.log(exception);
  }
}
