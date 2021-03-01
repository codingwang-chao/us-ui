<template>
<div class="newproject-container">
  <el-row gutter="12">
    <el-col :span="4">
      <div class="head-container">
        <el-input
          v-model="deptName"
          placeholder="请输入部门名称"
          clearable
          size="small"
          prefix-icon="el-icon-search"
          style="margin-bottom: 20px"
        />
        <el-tree
          class="filter-tree"
          :data="deptOptions"
          :props="defaultProps"
          default-expand-all
          :filter-node-method="filterNode"
          ref="tree">
        </el-tree>
      </div>
    </el-col>
    <!-- 项目数据 -->
    <el-col :span='20'>
      <el-form ref="queryForm" :model="queryParams" label-width="80px" :inline="true" v-show='isShowSearch'> 
        <el-form-item label="项目名称" prop='proName'>
          <el-input v-model="queryParams.proName" style="width:240px" size="small" placeholder="请输入项目名称" 
            @keyup="handleQuery"
          ></el-input>
        </el-form-item>
        <el-form-item label="权限id" prop='roleId'>
          <el-input v-model="queryParams.roleId" style="width:240px" size="small" placeholder="请输入项目权限id"
            @keyup="handleQuery"
          ></el-input>
        </el-form-item>
         <el-form-item label="状态" prop="projectStatus">
            <el-select
              v-model="queryParams.projectStatus"
              placeholder="项目状态"
              clearable
              size="small"
              style="width: 240px"
            >
              <el-option
                v-for="dict in statusOptions"
                :key="dict.dictValue"
                :label="dict.dictLabel"
                :value="dict.dictValue"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="创建时间">
            <el-date-picker
              v-model="daterange"
              type="daterange"
              align="right"
              size='small'
              style="width:240px"
              range-separator="-"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              :picker-options="pickerOptions">
            </el-date-picker>
          </el-form-item>
          <el-form-item>
            <el-button type="cyan" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
            <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
          </el-form-item>
      </el-form>
      <el-row class="btn5">
      <el-col :span='24'>
        <el-button type="primary" icon="el-icon-plus" size='mini' @click="handleAdd">
          新增
        </el-button>
        <el-button 
          type="success" 
          icon="el-icon-edit" 
          size='mini' 
          :disabled= "single"
          @click="handleUpdate"
        >
          修改
        </el-button>
        <el-button 
          type="danger" 
          icon="el-icon-delete" 
          size='mini' 
          :disabled= "multiple"            
          @click="handleDelete"
        >
          删除
        </el-button>
        <el-button type="warning" icon="el-icon-upload2" size='mini' @click="handleImport"
          v-hasPermi="['system:manager:import']"
        >
          导入
        </el-button>
        <el-button type="info" icon="el-icon-download" size='mini' @click="handleExport"
        >
          导出
        </el-button>
        <el-button icon="el-icon-search" circle size='mini' class="btn" @click="btnSearch"></el-button>
      </el-col>
      </el-row>
      <!-- 项目表格 -->
      <el-table
        ref="multipleTable"
        :data="userList"
        v-loading="loading"
        tooltip-effect="dark"
        style="width: 100%"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="50" align="center" ></el-table-column>
        <el-table-column
          prop="proName"
          label="项目名称"
        >
        </el-table-column>
        <el-table-column
          prop="id"
          label="项目id"
        >
        </el-table-column>
        <el-table-column
          prop="proDesc"
          label="项目描述"
        >
        </el-table-column>
        <el-table-column
          prop="roleId"
          label="权限ID"
        >
        </el-table-column>
        <el-table-column
          prop="projectStatus"
          label="状态"
        >
          <template slot-scope="scope">
            <el-switch
              v-model="scope.row.projectStatus"
              active-value="0"
              inactive-value="1"
              @change="handleStatusChange(scope.row)"
            ></el-switch>
          </template>
        </el-table-column>
        <el-table-column
          value-format="yyyy-MM-dd"
          prop="createTime"
          label="创建日期"
           width="190"
        >
        </el-table-column>
        <el-table-column
          fixed="right"
          label="操作"
          align="center"
          width="160">
          <template slot-scope="scope">
            <el-button
              icon="el-icon-edit"
              @click.native.prevent="handleUpdate(scope.row)"
              type="text"
              size="mini">
                修改
            </el-button>
            <el-button
              @click.native.prevent="handleDelete(scope.row)"
              type="text"
              icon="el-icon-delete"
              size="mini">
                移除
            </el-button>
            <!-- <el-button
              @click.native.prevent="handleResetPwd(scope.row)"
              type="text"
              icon="el-icon-key"
              size="mini">
                重置
            </el-button> -->
            </template>
          </el-table-column>
      </el-table>
      <!-- /项目表格 -->

      <!-- 分页功能代码 -->
        <pagination
          v-show="total>0"
          :total="total"
          :page.sync="queryParams.pageNum"
          :limit.sync="queryParams.pageSize"
          @pagination="getList"
          class="page"
        />
      <!-- /分页 -->

      <!-- 弹窗 -->
      <el-dialog :title="title" :visible.sync="open" width='600px' top='5vh' ref="form"  append-to-body>
        <el-form 
          :model="form" 
          ref="form" 
          label-width="80px" 
          class="demo-dynamic"
          :rules="rules"
        >
          <el-row>
            <el-col :span='12'>
              <el-form-item label="项目名称" prop='proName'>
                <el-input v-model="form.proName"></el-input>
              </el-form-item>
            </el-col>
            <!-- <el-col :span='12'>
              <el-form-item label="项目id" prop="id">
                <el-input v-model="form.id"></el-input>
              </el-form-item>
            </el-col> -->
            <el-col :span='12'>
              <el-form-item label="项目描述" prop='proDesc'>
                <el-input v-model="form.proDesc"></el-input>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span='12'>
              <el-form-item label="权限id" prop='roleId'>
                <el-input v-model="form.roleId"></el-input>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span='12'>
            </el-col>
            <el-col :span='12'>
              <el-form-item label="状态" prop='projectStatus'>
                <el-radio-group v-model="form.projectStatus">
                <el-radio
                  v-for="dict in statusOptions"
                  :key="dict.dictValue"
                  :label="dict.dictValue"
                >{{dict.dictLabel}}</el-radio>
              </el-radio-group>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span='12'>
            </el-col>
          </el-row>
          <el-row>
            <el-form-item label="备注">
              <el-input type="textarea" v-model="form.desc"></el-input>
            </el-form-item>
          </el-row>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </el-dialog>
       <!-- 项目导入对话框 -->
      <el-dialog :title="upload.title" :visible.sync="upload.open" width="400px" append-to-body>
        <el-upload
          ref="upload"
          :limit="1"
          accept=".xlsx, .xls"
          :headers="upload.headers"
          :action="upload.url + '?updateSupport=' + upload.updateSupport"
          :disabled="upload.isUploading"
          :on-progress="handleFileUploadProgress"
          :on-success="handleFileSuccess"
          :auto-upload="false"
          drag
        >
          <i class="el-icon-upload"></i>
          <div class="el-upload__text">
            将文件拖到此处，或
            <em>点击上传</em>
          </div>
          <div class="el-upload__tip" slot="tip">
            <el-checkbox v-model="upload.updateSupport" />是否更新已经存在的项目数据
            <el-link type="info" style="font-size:12px" @click="importTemplate">下载模板</el-link>
          </div>
          <div class="el-upload__tip" style="color:red" slot="tip">提示：仅允许导入“xls”或“xlsx”格式文件！</div>
        </el-upload>
        <div slot="footer" class="dialog-footer">
          <el-button type="primary" @click="submitFileForm">确 定</el-button>
          <el-button @click="upload.open = false">取 消</el-button>
        </div>
      </el-dialog>
    </el-col>
  </el-row>
</div>
</template>
<script>
import { treeselect } from "@/api/system/dept";
import Treeselect from '@riophae/vue-treeselect'
import '@riophae/vue-treeselect/dist/vue-treeselect.css'
import { getToken } from "@/utils/auth";
import { 
  listUser,
  deleteListUser,
  addProject,
  updateProject,
  getUserProfile,
  updateProfileStatus,
  exportProject,
  importTemplate
} from '@/api/newProject.js'
export default {
  component: {
    Treeselect 
  },
  data() {
    return {
      // 是否为修改操作
      isUpdate: false,
      value: true,
      title: '',
      // 是否显示搜索界面
      isShowSearch: true,
      deptOptions: undefined,
      // 遮罩层
      loading: true,
      // 选中数组
      ids: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      // 项目表格数据
      userList: null,
      // 弹出层标题
      title: "",
      // 部门树选项
      deptOptions: undefined,
      // 是否显示弹出层
      open: false,
      // 项目名称
      proName: 'undefined',
      // 日期范围
      dateRange: [],
      // 状态数据字典
      statusOptions: [],
      // 表单参数
      deptName: '',
      // 查询参数
      form:{},
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        userName: undefined,
        phonenumber: undefined,
        projectStatus: undefined,
        deptId: undefined,
        id: undefined,
        roleId: undefined
        // createTime:''
      },
      // 项目导入参数
      upload: {
        // 是否显示弹出层（项目导入）
        open: false,
        // 弹出层标题（项目导入）
        title: "",
        // 是否禁用上传
        isUploading: false,
        // 是否更新已经存在的项目数据
        updateSupport: 0,
        // 设置上传的请求头部
        headers: { Authorization: "Bearer " + getToken() },
        // 上传的地址
        url: process.env.VUE_APP_BASE_API + "/system/manager/import"
      },
      // 表单校验
      rules: {
        proName: [
          { required: true, message: "项目名称不能为空", trigger: "blur" }
        ],
        proDesc: [
          { required: true, message: "项目描述不能为空", trigger: "blur" }
        ],
        // id: [
        //   { required: true, message: "项目id不能为空", trigger: "blur" }
        // ],
        roleId: [
          { required: true, message: "项目权限不能为空", trigger: "blur" }
        ],
      },
    }
  },
  created() {
    this.getList(),
    this.getTreeselect(),
    this.getDicts("sys_normal_disable").then(response => {
      this.statusOptions = response.data;
    });
  },
  watch: {
    // 节点
    filterText(val) {
      this.$refs.tree.filter(val);
    }
  },
  methods: {
    /**项目表单*/
    getList() {
      this.loading = true;
      listUser(this.addDateRange(this.queryParams, this.dateRange)).then(response => {
        this.userList = response.rows;
        console.log(this.userList)
        this.total = response.total;
        this.loading = false;
      });
    },
    cancel() {
      this.open = false
      this.isUpdate = false
      this.reset()
    },
    submitForm: function() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.isUpdate) {
            updateProject(this.form).then(response => {
              this.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            addProject(this.form).then(response => {
              this.msgSuccess("新增成功");
              this.open = false;
              this.getList();
            });
          }
        }
      });
    },
    /** 查询部门下拉树结构 */
    getTreeselect() {
      treeselect().then(response => {
        this.deptOptions = response.data;
      });
    },
    // 筛选节点
    filterNode(value, data) {
      if (!value) return true;
      return data.label.indexOf(value) !== -1;
    },
    // 节点单击事件
    handleNodeClick(data) {
      this.queryParams.deptId = data.id;
      this.getList();
    },
      // 项目状态修改
    handleStatusChange(row) {
      let text = row.projectStatus === "0" ? "启用" : "停用";
      this.$confirm('确认要"' + text + '""' + row.proName + '"项目吗?', "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(function() {
        return updateProfileStatus(row.id, row.projectStatus);
      }).then(() => {
        this.msgSuccess(text + "成功");
      }).catch(function() {
        row.projectStatus = row.projectStatus === "0" ? "1" : "0";
      });
    },
    // 表单重置
    reset() {
      this.form = {
        id: undefined,
        deptId: undefined,
        proName: undefined,
        proDesc: undefined,
        projectStatus: "0",
        roleid: undefined
      },
      this.resetForm("form");
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.page = 1;
      this.getList();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.dateRange = [];
      this.resetForm("queryForm");
      this.handleQuery();
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.id);
      this.single = selection.length != 1;
      this.multiple = !selection.length;
    },
    // 新增、修改、删除、重置方法
    handleAdd() {
      this.isUpdate = false
      this.open = true
      this.reset();
      this.getTreeselect();
      this.title = "添加项目";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.open = true;
      this.reset();
      this.getTreeselect();
      const id = row.id || this.ids;
      getUserProfile(id).then(response => {
        this.form = response.data;
        console.log(response)
        this.title = "修改项目";
        this.isUpdate = true
      });
    },
    handleDelete(row) {
      const id = row.id || this.ids
      this.$confirm('是否确认删除项目id为"' + id + '"的数据项?', "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(function() {
        return deleteListUser(id);
      }).then(() => {
        this.getList();
        this.msgSuccess("删除成功");
      })
    },
    // 重置操作
    // handleResetPwd(rows) {
    //   alert('暂时无功能')
    // },

    /** 导出按钮操作 */
    handleExport() {
      const queryParams = this.queryParams;
      this.$confirm('是否确认导出所有项目数据项?', "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(function() {
        return exportProject(queryParams);
      }).then(response => {
        this.download(response.msg);
      })
    },
    /** 导入按钮操作 */
    handleImport() {
      this.upload.title = "项目导入";
      this.upload.open = true;
    },
    /** 下载模板操作 */
    importTemplate() {
      importTemplate().then(response => {
        this.download(response.msg);
      });
    },
    // 文件上传中处理
    handleFileUploadProgress(event, file, fileList) {
      this.upload.isUploading = true;
    },
    // 文件上传成功处理
    handleFileSuccess(response, file, fileList) {
      this.upload.open = false;
      this.upload.isUploading = false;
      this.$refs.upload.clearFiles();
      this.$alert(response.msg, "导入结果", { dangerouslyUseHTMLString: true });
      this.getList();
    },
    // 提交上  文件
    submitFileForm() {
      this.$refs.upload.submit();
    },
    // 是否显示搜索界面
    btnSearch() {
      this.isShowSearch = !this.isShowSearch
    }
  },
}
</script>

<style scoped>
.newproject-container{
  margin-top: 20px;
}
.btn5{
  margin-bottom: 10px;
}
.head-container{
  margin-left: 10px;
}
.page{
  margin-bottom: 70px;
}
.btn{
  float: right;
  margin-right: 30px;
}
.btn:hover{
  color: red;
}
</style>