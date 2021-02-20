<script>
export default {
  props: ["nodeList"],
  render(h) {
    return h("div", [...this.nodeList]);
  }
};
</script>
