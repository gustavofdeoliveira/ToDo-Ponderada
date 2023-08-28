import {
  createSlice,
  PayloadAction,
} from "@reduxjs/toolkit";
import { Task } from "../interfaces";
import { createTask, deleteAllTask, deleteTask, getTasks, importTask, updateTask } from "../components/Service/task";



const getSavedDirectories = (): string[] => {
  let dirList: string[] = [];
    dirList.push("Main");
  return dirList;
};

const token = localStorage.getItem("token") || "";

const defaultTasks: Task[] = [ 
];

const initialState: {
  tasks: Task[];
  directories: string[];
} = { 
  tasks:  defaultTasks,
  directories: getSavedDirectories(),
};

const tasksSlice = createSlice({
  name: "tasks",
  initialState: initialState,
  reducers: {
    setTasks(state, action: PayloadAction<Task[]>) {
      state.tasks = action.payload;
    },

    addNewTask(state, action: PayloadAction<Task>) {
      createTask(action.payload, token);
      state.tasks = [action.payload, ...state.tasks];
    },
    removeTask(state, action) {
      const newTasksList = state.tasks.filter(
        (task) => task.id !== action.payload
      );
      deleteTask(action.payload.id, token)
      state.tasks = newTasksList;
    },
    markAsImportant(state, action: PayloadAction<string>) {
      const newTaskFavorited = state.tasks.find(
        (task) => task.id === action.payload
      );
      
      newTaskFavorited!.important = !newTaskFavorited!.important;
      importTask(action.payload, newTaskFavorited!.important,token);

    },
    editTask(state, action: PayloadAction<Task>) {
      const taskId = action.payload.id;
      const newTaskEdited: Task = state.tasks.find(
        (task: Task) => task.id === taskId
      )!;
      updateTask(action.payload, token);
      const indexTask = state.tasks.indexOf(newTaskEdited);
      state.tasks[indexTask] = action.payload;
    },
    toggleTaskCompleted(state, action: PayloadAction<string>) {
      const taskId = action.payload;

      const currTask = state.tasks.find((task) => task.id === taskId)!;

      currTask.completed = !currTask.completed;
    },
    deleteAllData(state) {
      deleteAllTask(token);
      state.tasks = [];
      state.directories = ["Main"];
    },
    createDirectory(state, action: PayloadAction<string>) {
      const newDirectory: string = action.payload;
      const directoryAlreadyExists = state.directories.includes(newDirectory);
      if (directoryAlreadyExists) return;
      state.directories = [newDirectory, ...state.directories];
    },
    deleteDirectory(state, action: PayloadAction<string>) {
      const dirName = action.payload;

      state.directories = state.directories.filter((dir) => dir !== dirName);
      state.tasks = state.tasks.filter((task) => task.dir !== dirName);
    },
    editDirectoryName(
      state,
      action: PayloadAction<{ newDirName: string; previousDirName: string }>
    ) {
      const newDirName: string = action.payload.newDirName;
      const previousDirName: string = action.payload.previousDirName;
      const directoryAlreadyExists = state.directories.includes(newDirName);
      if (directoryAlreadyExists) return;

      const dirIndex = state.directories.indexOf(previousDirName);

      state.directories[dirIndex] = newDirName;
      state.tasks.forEach((task) => {
        if (task.dir === previousDirName) {
          task.dir = newDirName;
        }
      });
    },
  },
});

export const tasksActions = tasksSlice.actions;
export default tasksSlice.reducer;

