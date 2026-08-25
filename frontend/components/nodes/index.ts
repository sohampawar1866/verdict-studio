import InputNode from "./InputNode";
import ProsecutorNode from "./ProsecutorNode";
import DefenseNode from "./DefenseNode";
import FactCheckerNode from "./FactCheckerNode";
import ChiefJusticeNode from "./ChiefJusticeNode";
import CoTNode from "./CoTNode";
import AggregatorNode from "./AggregatorNode";

export const nodeTypes = {
  input: InputNode,
  prosecutor: ProsecutorNode,
  defense: DefenseNode,
  factchecker: FactCheckerNode,
  chiefjustice: ChiefJusticeNode,
  cot: CoTNode,
  aggregator: AggregatorNode,
};

export {
  InputNode,
  ProsecutorNode,
  DefenseNode,
  FactCheckerNode,
  ChiefJusticeNode,
  CoTNode,
  AggregatorNode,
};
