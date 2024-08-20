import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';

// import React from 'react';

// import { Signal } from '@lumino/signaling';

import { ISettingRegistry } from '@jupyterlab/settingregistry';
import { ICommandPalette } from '@jupyterlab/apputils';

// import { Checkbox } from '@jupyter/web-components';

// import { requestAPI } from './handler/handler';
import { FileManagerWidget } from './FileManager';
import { FilesystemItem } from './FilesystemItem';

import {
  Widget
} from '@lumino/widgets';

import { TreeItem, TreeView } from '@jupyter/web-components';

declare global {
  interface Window {
    fsspecModel: FsspecModel;
  }
}

class FsspecModel {
  // Frontend model for user's fsspec filesystems
  activeFilesystem = '';
  filesystemList: any;

  constructor() {

  }

  getStoredFilesystems() {
    // Fetch list of filesystems stored in user's config file
  }

  listActiveFilesystem() {
    // Return list of files for active FS
  }

  listFilesystem(name: String) {
    // Provide a FS name to list
  }
}

class FsspecWidget extends Widget {
  upperArea: any;
  model: any;
  fsList: any;
  selectedFsLabel: any;
  treeView: any;

  constructor() {
    super();
    this.model = window.fsspecModel;
    this.fsList = {};

    this.title.label = 'FSSpec'
    this.node.classList.add('jfss-root');

    let primaryDivider = document.createElement('div');
    primaryDivider.classList.add('jfss-primarydivider');

    this.upperArea = document.createElement('div');
    this.upperArea.classList.add('jfss-upperarea')

    let mainLabel = document.createElement('div');
    mainLabel.classList.add('jfss-mainlabel');
    mainLabel.innerText = 'Jupyter FSSpec'
    this.upperArea.appendChild(mainLabel);

    let hsep = document.createElement('div');
    hsep.classList.add('jfss-hseparator');

    let lowerArea = document.createElement('div');
    lowerArea.classList.add('jfss-lowerarea')

    let resultArea = document.createElement('div');
    resultArea.classList.add('jfss-resultarea')
    lowerArea.appendChild(resultArea);

    this.selectedFsLabel = document.createElement('div');
    this.selectedFsLabel.classList.add('jfss-selectedFsLabel');
    this.selectedFsLabel.innerText = 'Select a filesystem to display';
    resultArea.appendChild(this.selectedFsLabel);

    this.treeView = new TreeView();
    resultArea.appendChild(this.treeView);

    primaryDivider.appendChild(this.upperArea);
    primaryDivider.appendChild(hsep);
    primaryDivider.appendChild(lowerArea);

    this.node.appendChild((primaryDivider));
    this.stubFilesystems();
  }

  stubFilesystems() {
    this.addFilesystemItem('Hard Drive', 'Local');
    this.addFilesystemItem('Bar', 'S3',);
    this.addFilesystemItem('Biz', 'S3');
    this.addFilesystemItem('Wik', 'S3');
    this.addFilesystemItem('Rak', 'S3');
    this.addFilesystemItem('Rum', 'S3');
  }

  addFilesystemItem(fsname: string, fstype: string) {
    let fsItem = new FilesystemItem(fsname, fstype, [this.handleFilesystemClicked.bind(this)]);
    this.fsList[fsname] = fsItem;
    this.upperArea.appendChild(fsItem.element);
  }

  handleFilesystemClicked(fsname: string, fstype: string) {
    this.populateTree(fsname);
  }

  populateTree(fsname: string) {
    this.selectedFsLabel.innerText = `Files for: ${fsname}`;

    for (const _ of this.treeView.children) {
      this.treeView.removeChild(this.treeView.lastChild)
    }

    let item = new TreeItem();
    item.innerText = 'Item ' + new Date().toString();
    this.treeView.appendChild(item);

    let xx = new TreeItem();
    xx.innerText = 'Item ' + new Date().toString();
    item.appendChild(xx);
  }
}

/**
 * Initialization data for the jupyterFsspec extension.
 */
const plugin: JupyterFrontEndPlugin<void> = {
  id: 'jupyterFsspec:plugin',
  description: 'A Jupyter interface for fsspec.',
  autoStart: true,
  requires: [ICommandPalette],
  optional: [ISettingRegistry],
  activate: (
    app: JupyterFrontEnd,
    palette: ICommandPalette,
    settingRegistry: ISettingRegistry | null
  ) => {
    console.log('JupyterLab extension jupyterFsspec is activated!');

    let fsspecModel = new FsspecModel();
    window.fsspecModel = fsspecModel;

    let fsspec_widget = new FsspecWidget();
    fsspec_widget.id = 'jupyterFsspec:widget'
    app.shell.add(fsspec_widget, 'right');

    if (settingRegistry) {
      settingRegistry
        .load(plugin.id)
        .then(settings => {
          console.log('jupyterFsspec settings loaded:', settings.composite);
        })
        .catch(reason => {
          console.error('Failed to load settings for jupyterFsspec.', reason);
        });
    }

    const { commands } = app;
    const commandToolkit = 'jupyter_fsspec:open-toolkit';
    commands.addCommand(commandToolkit, {
      label: 'Open fsspec Toolkit Widget',
      execute: () => {
        const widget = new FileManagerWidget();
        widget.id = 'jupyter_fsspec-toolkit-widget';
        widget.title.label = 'fsspec Toolkit Widget';
        app.shell.add(widget, 'right');
      }
    });

    palette.addItem({
      command: commandToolkit,
      category: 'My Extensions',
      args: { origin: 'from palette ' }
    });
  }
};

export default plugin;
