#!/usr/bin/env python3
"""Filter and copy cube-suitable Minecraft block textures to public/blocks/.

Applies a rule-based filter system to exclude non-cube textures (doors, flowers,
face-specific textures, state variants, etc.) from the texture pack source.

Usage:
    python scripts/copy_block_textures.py
"""

import re
import shutil
from dataclasses import dataclass, field
from pathlib import Path


# ---------------------------------------------------------------------------
# Filter rule system
# ---------------------------------------------------------------------------

@dataclass
class FilterRule:
    """A named filter rule that matches texture stems by pattern."""

    name: str
    description: str
    rule_type: str  # "suffix", "prefix", "contains", "exact", "regex"
    patterns: list[str]
    _compiled_regex: list[re.Pattern] = field(default_factory=list, init=False, repr=False)
    _exact_set: frozenset[str] = field(default=frozenset(), init=False, repr=False)

    def __post_init__(self) -> None:
        if self.rule_type == "regex":
            self._compiled_regex = [re.compile(p) for p in self.patterns]
        elif self.rule_type == "exact":
            self._exact_set = frozenset(self.patterns)

    def matches(self, stem: str) -> bool:
        if self.rule_type == "suffix":
            return any(stem.endswith(p) for p in self.patterns)
        elif self.rule_type == "prefix":
            return any(stem.startswith(p) for p in self.patterns)
        elif self.rule_type == "contains":
            return any(p in stem for p in self.patterns)
        elif self.rule_type == "exact":
            return stem in self._exact_set
        elif self.rule_type == "regex":
            return any(r.search(stem) for r in self._compiled_regex)
        return False


# ---------------------------------------------------------------------------
# Exclude rules
# ---------------------------------------------------------------------------

EXCLUDE_RULES: list[FilterRule] = [
    FilterRule(
        "face_suffixes", "Face-specific textures for multi-face blocks",
        "suffix", ["_top", "_bottom", "_side", "_front", "_back", "_end"],
    ),
    FilterRule(
        "state_suffixes", "State variants (keep only base state)",
        "suffix", ["_on", "_off", "_lit", "_powered", "_triggered", "_conditional"],
    ),
    FilterRule(
        "overlay", "Overlay textures",
        "suffix", ["_overlay"],
    ),
    FilterRule(
        "growth_stages", "Crop/growth stages",
        "contains", ["_stage", "stage_"],
    ),
    FilterRule(
        "destroy_stages", "Block breaking animation",
        "prefix", ["destroy_stage_"],
    ),
    FilterRule(
        "dig_progression", "Archaeology/melt stage variants",
        "prefix", ["suspicious_sand_", "suspicious_gravel_", "frosted_ice_"],
    ),
    FilterRule(
        "liquids_fire", "Non-block effects",
        "exact", [
            "water_flow", "water_still", "water_overlay",
            "lava_flow", "lava_still",
            "fire_0", "fire_1", "soul_fire_0", "soul_fire_1",
            "nether_portal", "debug", "debug2",
        ],
    ),
    FilterRule(
        "command_blocks", "Command block faces",
        "prefix", ["command_block_", "chain_command_block_", "repeating_command_block_"],
    ),
    FilterRule(
        "structure_test", "Structure/test blocks",
        "regex", [r"^structure_block", r"^test_(block|instance_block)"],
    ),
    FilterRule(
        "doors", "Door top/bottom halves",
        "contains", ["_door_"],
    ),
    FilterRule(
        "multi_part", "Multi-part block faces",
        "prefix", [
            "bell_", "cauldron_", "composter_", "hopper_",
            "grindstone_", "stonecutter_", "piston_", "respawn_anchor_",
        ],
    ),
    FilterRule(
        "directional", "Directional/multi-face blocks",
        "prefix", ["crafter_", "dried_ghast_", "vault_", "sniffer_egg_"],
    ),
    FilterRule(
        "trapdoors", "Flat panel shape",
        "contains", ["trapdoor"],
    ),
    FilterRule(
        "fences_gates", "Non-cube fence shapes",
        "contains", ["fence"],
    ),
    FilterRule(
        "glass_panes", "Thin panel shape",
        "contains", ["glass_pane"],
    ),
    FilterRule(
        "shulker_boxes", "Non-standard cube",
        "contains", ["shulker_box"],
    ),
    FilterRule(
        "shelves", "Shelf shapes",
        "suffix", ["_shelf"],
    ),
    FilterRule(
        "non_cube_items", "Items/blocks with non-cube geometry",
        "exact", [
            # Rails
            "rail", "powered_rail", "detector_rail", "activator_rail", "rail_corner",
            # Flowers
            "allium", "azure_bluet", "blue_orchid", "cornflower", "dandelion",
            "lily_of_the_valley", "orange_tulip", "oxeye_daisy", "pink_tulip",
            "poppy", "red_tulip", "white_tulip", "wither_rose", "torchflower",
            "open_eyeblossom", "open_eyeblossom_emissive", "closed_eyeblossom",
            "wildflowers", "wildflowers_stem",
            # Saplings
            "acacia_sapling", "birch_sapling", "cherry_sapling", "dark_oak_sapling",
            "jungle_sapling", "oak_sapling", "spruce_sapling", "pale_oak_sapling",
            "mangrove_propagule", "mangrove_propagule_hanging",
            # Mushrooms (standalone)
            "brown_mushroom", "red_mushroom", "crimson_fungus", "warped_fungus",
            # Torches
            "torch", "soul_torch", "redstone_torch", "redstone_torch_off",
            "copper_torch",
            # Lanterns
            "lantern", "soul_lantern", "copper_lantern",
            # Misc non-cubes
            "ladder", "anvil", "lever", "tripwire", "tripwire_hook",
            "flower_pot", "brewing_stand", "brewing_stand_base",
            "cobweb", "comparator", "comparator_on", "repeater", "repeater_on",
            "lily_pad", "sea_pickle", "dead_bush", "fern", "short_grass",
            "short_dry_grass", "tall_dry_grass",
            "sugar_cane", "vine", "sculk_vein", "glow_lichen",
            "hanging_roots", "pale_hanging_moss", "pale_hanging_moss_tip",
            "azalea_plant", "nether_sprouts", "spore_blossom", "spore_blossom_base",
            "pink_petals", "pink_petals_stem",
            "crimson_roots", "crimson_roots_pot", "warped_roots", "warped_roots_pot",
            "end_rod", "conduit", "dragon_egg",
            "chorus_flower", "chorus_flower_dead", "chorus_plant",
            "item_frame", "glow_item_frame",
            "campfire_fire", "campfire_log", "campfire_log_lit",
            "soul_campfire_fire", "soul_campfire_log_lit",
            "frogspawn", "bush", "cactus_flower",
            "leaf_litter", "pale_moss_carpet", "pale_moss_carpet_side_small",
            "pale_moss_carpet_side_tall",
            "firefly_bush", "firefly_bush_emissive",
            "resin_clump",
            "scaffolding_bottom", "scaffolding_side", "scaffolding_top",
            "spawner",
            # Attached stems
            "attached_melon_stem", "attached_pumpkin_stem",
            "melon_stem", "pumpkin_stem",
        ],
    ),
    FilterRule(
        "non_cube_prefixes", "Non-cube shape prefixes",
        "prefix", [
            "pointed_dripstone_", "calibrated_sculk_sensor_",
            "pitcher_crop_", "cocoa_",
            "potted_azalea_", "potted_flowering_azalea_",
            "sweet_berry_bush_",
        ],
    ),
    FilterRule(
        "non_cube_contains", "Non-cube shape patterns",
        "contains", ["dripleaf", "candle", "_chain", "_grate", "_bars", "_bulb"],
    ),
    FilterRule(
        "tall_plants", "Multi-block tall plants",
        "regex", [r"^(sunflower|lilac|peony|rose_bush|tall_grass|large_fern|tall_seagrass)_"],
    ),
    FilterRule(
        "vines_stems", "Climbing/underwater plants",
        "exact", [
            "twisting_vines", "twisting_vines_plant",
            "weeping_vines", "weeping_vines_plant",
            "cave_vines", "cave_vines_lit",
            "cave_vines_plant", "cave_vines_plant_lit",
            "kelp", "kelp_plant", "seagrass",
        ],
    ),
    FilterRule(
        "bamboo_parts", "Non-block bamboo parts",
        "exact", [
            "bamboo_large_leaves", "bamboo_small_leaves",
            "bamboo_singleleaf", "bamboo_stalk", "bamboo_stage0",
        ],
    ),
    FilterRule(
        "amethyst_non_blocks", "Non-cube crystal shapes",
        "exact", [
            "amethyst_cluster", "small_amethyst_bud",
            "medium_amethyst_bud", "large_amethyst_bud",
        ],
    ),
    FilterRule(
        "redstone_dust", "Flat redstone dust",
        "prefix", ["redstone_dust_"],
    ),
    FilterRule(
        "egg_variants", "Non-cube egg shapes",
        "exact", [
            "sniffer_egg", "turtle_egg",
            "turtle_egg_slightly_cracked", "turtle_egg_very_cracked",
        ],
    ),
    FilterRule(
        "anvil_damaged", "Damaged state variants",
        "regex", [r"^(chipped|damaged)_anvil"],
    ),
    FilterRule(
        "misc_exact", "Final catch-all for remaining non-cube items",
        "exact", [
            "chain", "iron_bars", "iron_chain",
            "beacon", "mushroom_block_inside",
            "lightning_rod", "lightning_rod_on",
            "exposed_lightning_rod", "weathered_lightning_rod", "oxidized_lightning_rod",
            "copper_lantern", "exposed_copper_lantern",
            "weathered_copper_lantern", "oxidized_copper_lantern",
        ],
    ),
]


# ---------------------------------------------------------------------------
# Include overrides (rescue specific files from exclusion)
# ---------------------------------------------------------------------------

INCLUDE_OVERRIDES: list[FilterRule] = [
    FilterRule(
        "cracked_blocks", "Distinct block types, not damage states",
        "exact", [
            "cracked_stone_bricks", "cracked_nether_bricks",
            "cracked_deepslate_bricks", "cracked_polished_blackstone_bricks",
            "cracked_deepslate_tiles",
        ],
    ),
    FilterRule(
        "coral_blocks", "Full cube coral blocks",
        "regex", [r"^(dead_)?(brain|bubble|fire|horn|tube)_coral_block$"],
    ),
    FilterRule(
        "mushroom_blocks", "Cube mushroom blocks",
        "exact", ["brown_mushroom_block", "red_mushroom_block", "mushroom_stem"],
    ),
]


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main() -> None:
    project_root = Path(__file__).parent.parent
    source_dir = project_root / "texture_pack" / "assets" / "minecraft" / "textures" / "block"
    dest_dir = project_root / "public" / "blocks"

    if not source_dir.exists():
        raise SystemExit(f"Error: source directory not found at {source_dir}")

    # Collect all PNG files
    all_files = sorted(source_dir.glob("*.png"))
    if not all_files:
        raise SystemExit(f"No PNG files found in {source_dir}")

    # Clear destination
    if dest_dir.exists():
        shutil.rmtree(dest_dir)
    dest_dir.mkdir(parents=True)

    # Track stats
    exclude_counts: dict[str, list[str]] = {r.name: [] for r in EXCLUDE_RULES}
    include_counts: dict[str, list[str]] = {r.name: [] for r in INCLUDE_OVERRIDES}
    copied: list[str] = []

    for path in all_files:
        stem = path.stem

        # Check exclude rules (first match wins)
        excluded_by = None
        for rule in EXCLUDE_RULES:
            if rule.matches(stem):
                excluded_by = rule
                break

        if excluded_by:
            # Check include overrides
            rescued_by = None
            for rule in INCLUDE_OVERRIDES:
                if rule.matches(stem):
                    rescued_by = rule
                    break

            if rescued_by:
                include_counts[rescued_by.name].append(stem)
                shutil.copy2(path, dest_dir / path.name)
                copied.append(stem)
            else:
                exclude_counts[excluded_by.name].append(stem)
        else:
            shutil.copy2(path, dest_dir / path.name)
            copied.append(stem)

    # Print summary
    print("=== Exclude Rule Summary ===")
    total_excluded = 0
    for rule in EXCLUDE_RULES:
        count = len(exclude_counts[rule.name])
        if count > 0:
            total_excluded += count
            print(f"  {rule.name:<25} {count:>4}  ({rule.description})")
            for stem in exclude_counts[rule.name]:
                print(f"    - {stem}")

    print("\n=== Include Override Summary ===")
    total_rescued = 0
    for rule in INCLUDE_OVERRIDES:
        count = len(include_counts[rule.name])
        if count > 0:
            total_rescued += count
            print(f"  {rule.name:<25} {count:>4}  ({rule.description})")
            for stem in include_counts[rule.name]:
                print(f"    + {stem}")

    print(f"\n=== Totals ===")
    print(f"  Source textures:  {len(all_files):>4}")
    print(f"  Excluded:         {total_excluded:>4}")
    print(f"  Rescued:          {total_rescued:>4}")
    print(f"  Copied:           {len(copied):>4}")
    print(f"\nOutput: {dest_dir}")


if __name__ == "__main__":
    main()
