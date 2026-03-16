import os


def convert_gbk_to_utf8(input_file, output_file):
    if not os.path.exists(input_file):
        print(f"Error: Input file '{input_file}' not found.")
        return
    print(f"Converting '{input_file}' from GBK to UTF-8...")

    try:
        with open(input_file, "r", encoding="gbk", errors="ignore") as file_in:
            content = file_in.read()
        with open(output_file, "w", encoding="utf-8") as file_out:
            file_out.write(content)
        print(f"Successfully converted to '{output_file}'")
    except Exception as e:
        print(f"Error occurred: {e}")


if __name__ == "__main__":
    input_csv = "./ecdict.csv"
    output_csv = "./ecdict_utf8.csv"
    convert_gbk_to_utf8(input_csv, output_csv)
