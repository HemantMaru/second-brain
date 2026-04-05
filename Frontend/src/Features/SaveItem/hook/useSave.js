import {
  CreateItem,
  getCreateItem,
  deleteSavedItems,
  editSavedItems,
  togglePin,
} from "../services/save.api.js";
import { setLoading, setsaveItem } from "../save.slice.js";
import { useDispatch } from "react-redux";
export const useSave = () => {
  const dispatch = useDispatch();
  const handleCreateSave = async (url, tags, collection, note) => {
    const response = await CreateItem(url, tags, collection, note);
  };

  const handleGetCreateSave = async () => {
    dispatch(setLoading(true));
    const response = await getCreateItem();
    dispatch(setsaveItem(response.data));
    dispatch(setLoading(false));
  };

  const handleDeleteSaveItems = async (id) => {
    dispatch(setLoading(true));
    const response = await deleteSavedItems(id);
    dispatch(setLoading(false));
  };

  const handleEditSaveItems = async (id, url, note) => {
    dispatch(setLoading(true));
    const response = await editSavedItems(id, url, note);
    dispatch(setLoading(false));
  };

  const handleTogglePin = async (id) => {
    await togglePin(id);
    await handleGetCreateSave(); // 🔥 refresh list
  };

  return {
    handleCreateSave,
    handleGetCreateSave,
    handleDeleteSaveItems,
    handleEditSaveItems,
    handleTogglePin,
  };
};
