import { Stack } from "expo-router";

export default function HiitWorkoutsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
      }}
    />
  );
}
