import Vue from 'vue'
import Vuex from 'vuex'
import {decryption, encryption} from '../utils/crypto';
import storage from '../utils/storage';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    taskIds: [],
    tasks: [],
    init: false
  },
  actions: {
    init: ({commit, state}, {password}) => {
      return new Promise((resolve, reject) => {
        try {
          if (!state.init) {
            commit('initData', {password})
          }
          resolve();
        } catch (e) {
          reject('can not get data')
        }
      })
    },
    initNew: ({commit, state}, {password}) => {
      return new Promise((resolve, reject) => {
        commit('initNew', {password});
        resolve();
      })
    }
  },
  mutations: {
    initNew: (state, {password}) => {
      console.log('start')
      storage.setSession('taskIds', encryption(JSON.stringify(state.taskIds), password))
    },
    updateTask: (state, {
      task,
      password
    }) => {
      if (state.taskIds.indexOf(task.id) != -1) {
        storage.setSession('task_' + task.id, encryption(JSON.stringify(task), password));
      }
    },
    addTask: (state, {task, password}) => {
      state.tasks.push(task);
      state.taskIds.push(task.name);
      storage.setSession('task_' + task.id, encryption(JSON.stringify(task), password));
      storage.setSession('taskIds', encryption(JSON.stringify(state.taskIds), password))
    },
    removeTask: (state, {
      taskId,
      password
    }) => {
      let i = state.taskIds.indexOf(taskId);
      if (i !== -1) {
        state.taskIds.splice(i, 1)
        state.tasks.splice(i, 1)
        storage.removeStorage('task_' + taskId);
        storage.setSession('taskIds', encryption(JSON.stringify(state.taskIds), password));
      }
    },
    initData: (state, {password}) => {
      let data = decryption(storage.getSession('taskIds'), password);
      console.log(data)
      state.taskIds = JSON.parse(data);

      for (let i = 0, len = state.taskIds.length; i < len; i++) {
        let id = state.taskIds[i];
        state.tasks.push(JSON.parse(decryption(storage.getSession('task_' + id), password)))
      }
      state.init = true;
    }
  }
})
