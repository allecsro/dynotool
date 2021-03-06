import set from 'lodash/set';
import {
  LOAD_TABLES,
  FILTER_TABLES,
  LOAD_TABLE,
  UPDATE_TABLE,
  SCAN_ITEMS,
  QUERY_ITEMS,
  GET_ITEM,
  CLEAR_ITEM,
  UPDATE_ITEM,
} from '../actions/dynamodb.action';

const DynamoDbReducer = (state = window.INITIAL_STATE.dynamodb, action) => {
  switch (action.type) {

    case `${LOAD_TABLES}_PENDING`:
      // display loading state
      return Object.assign({}, state, {
        isLoadingTables: true,
      });

    case `${LOAD_TABLES}_FULFILLED`:
      return Object.assign({}, state, {
        tables: action.payload.meta,
        totalTablesCount: action.payload.meta.length,
        filteredTablesCount: action.payload.meta.length,
        isLoadingTables: false,
      });

    case `${LOAD_TABLES}_REJECTED`:
      return Object.assign({}, state, {
        error: action.payload,
        isLoadingTables: false,
      });

    case FILTER_TABLES: {
      const unfilteredTables = state.unfilteredTables ? state.unfilteredTables : state.tables;
      let tables = [];

      if (action.payload || action.payload.trim().length) {
        const filter = action.payload.toLowerCase();
        for (let i = 0; i < unfilteredTables.length; i += 1) {
          const table = unfilteredTables[i];
          if (table.TableName.toLowerCase().indexOf(filter) >= 0) {
            tables.push(table);
          }
        }
      } else {
        tables = unfilteredTables;
      }


      return Object.assign({}, state, {
        unfilteredTables,
        tables,
        filteredTablesCount: tables.length,
      });
    }

    case LOAD_TABLE: {
      const tableName = action.payload;
      if (state.tables && state.tables.length > 0) {
        for (let i = 0; i < state.tables.length; i += 1) {
          const table = state.tables[i];
          if (table.TableName === tableName) {
            return Object.assign({}, state, {
              table,
            });
          }
        }
      }

      return state;
    }

    case UPDATE_TABLE: {
      const table = action.payload.TableDescription;
      const unfilteredTables = [].concat(state.tables);
      const tables = [].concat(state.tables);
      const newState = Object.assign({}, state, { table });

      if (tables && tables.length) {
        for (let i = 0; i < tables.length; i += 1) {
          if (table.TableName === tables[i].TableName) {
            tables[i] = table;

            Object.assign(newState, {
              tables,
            });

            break;
          }
        }
      }

      if (unfilteredTables && unfilteredTables.length) {
        for (let i = 0; i < unfilteredTables.length; i += 1) {
          if (table.TableName === unfilteredTables[i].TableName) {
            unfilteredTables[i] = table;

            Object.assign(newState, {
              unfilteredTables,
            });

            break;
          }
        }
      }

      return newState;
    }

    case `${SCAN_ITEMS}_PENDING`:
    case `${QUERY_ITEMS}_PENDING`:
      // display loading state
      return Object.assign({}, state, {
        isLoadingItems: true,
      });

    case `${SCAN_ITEMS}_FULFILLED`:
    case `${QUERY_ITEMS}_FULFILLED`:
      return Object.assign({}, state, {
        items: action.payload.Items,
        totalCount: action.payload.Count,
        scanCount: action.payload.ScannedCount,
        isLoadingItems: false,
      });

    case `${SCAN_ITEMS}_REJECTED`:
    case `${QUERY_ITEMS}_REJECTED`:
      return Object.assign({}, state, {
        error: action.payload,
        isLoadingItems: false,
      });

    case `${GET_ITEM}_PENDING`:
      return Object.assign({}, state, {
        item: null,
      });

    case `${GET_ITEM}_FULFILLED`:
      return Object.assign({}, state, {
        item: action.payload.Item,
      });

    case CLEAR_ITEM:
      return Object.assign({}, state, {
        item: null,
      });

    case UPDATE_ITEM:
      return Object.assign({}, state, {
        item: set(
          Object.assign({}, state.item), action.payload.keypath, action.payload.value,
        ),
      });

    default:
      // If no action matched, we return the state unchanged
      return state;
  }
};

export default DynamoDbReducer;
