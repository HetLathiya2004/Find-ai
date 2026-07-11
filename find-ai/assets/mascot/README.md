# Fin mascot assets

Fin is rendered as a resolution-independent SVG component in
`components/ui/Mascot.tsx`. The component includes five consistent poses:
`idle`, `celebrate`, `encourage`, `sad`, and `thinking`.

Keeping the vectors in the component avoids an additional Metro SVG
transformer and lets the existing Expo SDK render every pose through
`react-native-svg`.

TODO: Pixel-match these vectors if the missing `Mascot-Find/src` UI and
exported Lovable mascot artwork become available.
