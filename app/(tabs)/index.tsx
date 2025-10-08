import { createHomeStyles } from "@/assets/styles/home.styles";
import Header from "@/components/Header";
import ToDoInput from "@/components/ToDoInput";


import useTheme from "@/hooks/useTheme";

import EmptyListComponent from "@/components/EmptyListComponent";
import LoadingSpinner from "@/components/LoadingSpinner";
import { api } from "@/convex/_generated/api";
import { Doc, Id } from "@/convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { LinearGradient } from "expo-linear-gradient";
import { useState } from "react";
import {
  Alert,
  FlatList,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import TodoItem from "../../components/TodoItem";

type Todo = Doc<"todos">;

export default function Index() {
  const { colors } = useTheme();

  const [editingId, setEditingId] = useState<Id<"todos"> | null>(null);
  const [editingText, setEditingText] = useState("");
  const homeStyles = createHomeStyles(colors);
  const todos = useQuery(api.todos.getTodos) ?? [];

  const isLoading = todos === undefined;
  const toggleTodo = useMutation(api.todos.toggleTodo);
  const deleteTodo = useMutation(api.todos.deleteTodo);
  const updateTodo = useMutation(api.todos.updateTodo);
  if (isLoading) return <LoadingSpinner />;

  const handleToggleTodo = async (id: Id<"todos">) => {
    try {
      await toggleTodo({ id });
    } catch (error) {
      Alert.alert("Error", "Failed to toggle todo");
    }
  };

  const handleDeleteTodo = async (id: Id<"todos">) =>
    Alert.alert("Delete Todo", "Are you sure you want to delete this todo?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteTodo({ id });
          } catch (error) {
            Alert.alert("Error", "Failed to delete todo");
          }
        },
      },
    ]);

  const handleEditTodo = (todo: Todo) => {
    setEditingText(todo.text);
    setEditingId(todo._id);
  };
  const handleSaveEdit = async () => {
    if (editingId)
      try {
        await updateTodo({ id: editingId, text: editingText.trim() });
        setEditingId(null);
        setEditingText("");
      } catch (error) {
        Alert.alert("Error", "Failed to update todo");
      }
  };

  const handleCancelEdit = (todo: Todo) => {
    setEditingId(null);
    setEditingText("");
  };

  const renderTodoItem = ({ item }: { item: Todo }) => (
    <TodoItem
      item={item}
      isEditing={editingId === item._id}
      editingText={editingText}
      colors={colors}
      homeStyles={homeStyles}
      onToggle={handleToggleTodo}
      onEdit={handleEditTodo}
      onDelete={handleDeleteTodo}
      onSaveEdit={handleSaveEdit}
      onCancelEdit={handleCancelEdit}
      setEditingText={setEditingText}
    />
  );

  return (
    <LinearGradient
      colors={colors.gradients.background}
      style={homeStyles.container}
    >
      <StatusBar barStyle={colors.statusBarStyle} />
      <SafeAreaView style={homeStyles.safeArea}>
        <Header />
        <ToDoInput />
        <FlatList
          data={todos}
          renderItem={renderTodoItem}
          keyExtractor={(item) => item._id}
          style={homeStyles.todoList}
          contentContainerStyle={homeStyles.todoListContent}
          ListEmptyComponent={<EmptyListComponent />}
          showsVerticalScrollIndicator={false}
        />
      </SafeAreaView>
    </LinearGradient>
  );
}
