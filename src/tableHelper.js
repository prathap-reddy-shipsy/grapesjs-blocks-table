export const cellType = 'customCell';
export const cellHeaderType = 'customHeaderCell';
export const rowType = 'row';

export const getCellToolbar = () => {
  let toolbar = [
    { attributes: { class: 'column-actions columns-operations', title: 'Columns operations' }, command: 'table-show-columns-operations' },
    { attributes: { class: 'row-actions rows-operations', title: 'Rows operations' }, command: 'table-show-rows-operations' },
    { attributes: { class: 'fa fa-arrow-up', title: 'Select parent component' }, command: 'table-select' }
  ]
  if (editor.getSelected().getAttributes()['colspan'] > 1 || editor.getSelected().getAttributes()['rowspan'] > 1) {
    toolbar.push({ attributes: { class: 'fa fa fa-th-large', title: 'Unmerge cells' }, command: 'table-unmerge-cells' })
  }
  return toolbar;
}

export const getTableToolbar = (component) => {
  const tb = component.get('toolbar');
  let settingExists = tb.find(o=> o.command === 'open-traits-settings');
  if(!settingExists) {
    tb.push({ command: 'open-traits-settings', attributes: {class: 'fa fa-cog', title: 'Settings'} });
  }
  return tb;
}

export function insertColumn(tableComponent, addAtIndex, updateProps = false){
  tableComponent.components().forEach((component, index) => {
    if(index === 0 && tableComponent.props().hasHeaders) {
      component.components().add({ type: cellHeaderType }, {at: addAtIndex});
    } else {
      component.components().add({ type: cellType }, {at: addAtIndex});
    }
  });

  if(updateProps){
    tableComponent.set({nColumns: Number(tableComponent.props().nColumns) + 1})
  }
}

export function insertRow(tableComponent, addAtIndex, updateProps = false){
  tableComponent.components().add({
    type: rowType,
    components: [...Array(tableComponent.components().at(0).components().length).keys()].map(() => ({ type: cellType }))
  }, {
    at: addAtIndex
  });

  if(updateProps){
    tableComponent.set({nRows: Number(tableComponent.props().nRows) + 1})
  }
}

export function removeColumn(tableComponent, removeAtIndex, updateProps = false) {
  tableComponent.components().forEach(component => {
    component.components().at(removeAtIndex).remove();
  });
  if(updateProps){
    tableComponent.set({nColumns: Number(tableComponent.props().nColumns) - 1})
  }
}

export function removeRow(tableComponent, removeAtIndex, updateProps = false) {
  tableComponent.components().at(removeAtIndex).remove()
  if(updateProps){
    tableComponent.set({nRows: Number(tableComponent.props().nRows) - 1})
  }
}

export function toggleHeaderRow(tableComponent, updateProps = false){
  let toggleOn = updateProps == false? tableComponent.props().hasHeaders: !tableComponent.props().hasHeaders;
  if(toggleOn) {
    let headers = [];
    for (let index = 0; index < tableComponent.props().nColumns; index++) {
      headers.push({ type: cellHeaderType });
    }
    tableComponent.components().add({ type: rowType, components: headers }, { at: 0 });
  } else {
    tableComponent.components().at(0).remove()
  }
  if(updateProps){
    tableComponent.set({hasHeaders: toggleOn})
  }
}

export function highlightCellsWithSize(table) {
  table.components().forEach(row => {
    row.components().forEach(cell => {
      let cellStyle = cell.getStyle();
      if (cellStyle && (cellStyle.width || cellStyle.height)) {
        if (cell.getClasses().includes('table-cell-highlight')) {
          cell.removeClass('table-cell-highlight');
        } else {
          cell.addClass('table-cell-highlight');
        }
      }
    });
  });
}

export function clearCellsWithSize(table) {
  table.components().forEach(row => {
    row.components().forEach(cell => {
      let cellStyle = cell.getStyle();
      if (cellStyle) {
        if (cellStyle.width) {
          cell.removeStyle('width');
        }
        if (cellStyle.height) {
          cell.removeStyle('height');
        }
        if (cell.getClasses().includes('table-cell-highlight')) {
          cell.removeClass('table-cell-highlight');
        }
      }
    });
  });
}

export function updateAttributesAndCloseModal (componentId) {
  let nRows = document.getElementById('nRows').value;
  let nColumns = document.getElementById('nColumns').value;

  if (nRows && nColumns && nRows > 0 && nColumns > 0) {
    let tableModel = getAllComponents(editor.getWrapper()).find(model => model.cid == componentId);
    tableModel.props().nRows = nRows;
    tableModel.props().nColumns = nColumns;
    tableModel.createTable();
  } else {
    alert('Missing number of rows or number of columns.');
    tableModel.remove();
  }
  editor.Modal.close();
}

export function updateTableToolbarSubmenu (submenuToShow, submenuToHide) {
  let selected = editor.getSelected();
  let currentMenu = $('ul#toolbar-submenu-'+submenuToShow);
  if(currentMenu.length > 0){
    $('.toolbar-submenu').slideUp('slow');
    $('ul#toolbar-submenu-'+submenuToShow).slideDown('slow');
  } else {
    if (selected && selected.is(cellType) || selected.is(cellHeaderType)) {
      let rowComponent = selected.parent();
      if ($('.' + submenuToHide + '-operations .toolbar-submenu').length > 0){
        $('.' + submenuToHide + '-operations .toolbar-submenu').slideUp('slow');
      }
      if ($('.' + submenuToShow + '-operations .toolbar-submenu').length > 0){
        if ($('.' + submenuToShow + '-operations .toolbar-submenu').css('display') != 'none') {
          $('.' + submenuToShow + '-operations .toolbar-submenu').slideUp('slow');
          return;
        }
        $('.' + submenuToShow + '-operations .toolbar-submenu').slideDown('slow');
      } else {
        let htmlString = '';
        if (submenuToShow === 'rows') {
          htmlString = `
          <ul id="toolbar-submenu-rows" class="toolbar-submenu ` + ($('.gjs-toolbar').position().left > 150 ? 'toolbar-submenu-right' : '') + `" style="display: none;">
            <li class="table-toolbar-submenu-run-command" data-command="table-insert-row-above" ` + (selected.is(cellHeaderType) ? 'style="display: none;"' : '') + `><i class="fa fa-chevron-up" aria-hidden="true"></i> Insert row above</li>
            <li class="table-toolbar-submenu-run-command" data-command="table-insert-row-below" ><i class="fa fa-chevron-down" aria-hidden="true"></i> Insert row below</li>
            <li class="table-toolbar-submenu-run-command" data-command="table-delete-row" `+ (selected.is(cellHeaderType) ? 'style="display: none;"' : '') +` ><i class="fa fa-trash" aria-hidden="true"></i> Delete Row</li>
            <li class="table-toolbar-submenu-run-command" data-command="table-toggle-header" `+ (selected.is(cellType) ? 'style="display: none;"' : '') +`><i class="fa fa-trash" aria-hidden="true"></i> Remove Header</li>
            <li id="button-merge-cells-right" class="table-toolbar-submenu-run-command" data-command="table-merge-cells-right" ` + (selected.collection.indexOf(selected) + 1 == selected.parent().components().length ? 'style="display: none;"' : '') + `><i class="fa fa-arrows-h" aria-hidden="true"></i> Merge cell right</li>
          </ul>
          `;
        } else {
          let rowspan = selected.getAttributes()['rowspan'] ? selected.getAttributes()['rowspan'] : 0;

          htmlString = `
          <ul id="toolbar-submenu-columns" class="toolbar-submenu ` + ($('.gjs-toolbar').position().left > 150 ? 'toolbar-submenu-right' : '') + `" style="display: none;">
            <li class="table-toolbar-submenu-run-command" data-command="table-insert-column-left" ><i class="fa fa-chevron-left" aria-hidden="true"></i> Insert column left</li>
            <li class="table-toolbar-submenu-run-command" data-command="table-insert-column-right" ><i class="fa fa-chevron-right" aria-hidden="true"></i> Insert column right</li>
            <li class="table-toolbar-submenu-run-command" data-command="table-delete-column" ><i class="fa fa-trash" aria-hidden="true"></i> Delete column</li>
            <li id="button-merge-cells-down" class="table-toolbar-submenu-run-command" data-command="table-merge-cells-down" ` + (rowComponent.collection.indexOf(rowComponent) + rowspan == rowComponent.parent().components().length || selected.is(cellHeaderType) ? 'style="display: none;"' : '') + `><i class="fa fa-arrows-v" aria-hidden="true"></i> Merge cell down</li>
          </ul>
          `;
        }
        $('.toolbar-submenu').slideUp('slow');
        $('.' + submenuToShow + '-operations').parent().append(htmlString);
        $('ul#toolbar-submenu-'+submenuToShow).slideDown('slow');
      }
    }
  }
}

export function refreshEditorSelected() {
  let selected = editor.getSelected();
  editor.selectRemove(selected);
  setTimeout(function() { editor.select(selected); }, 50);
}
