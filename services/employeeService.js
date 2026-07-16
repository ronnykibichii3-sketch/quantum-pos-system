const prisma = require('../prismaClient');
const { hashPassword, signToken, verifyPassword } = require('../utils/employeeAuth');

function sanitizeEmployee(employee) {
  if (!employee) {
    return employee;
  }

  const { passwordHash, ...rest } = employee;
  return rest;
}

exports.createEmployee = async (data) => {
  const { password, passwordHash, ...rest } = data;
  const resolvedPassword = password || passwordHash;

  if (!resolvedPassword) {
    throw new Error('password is required');
  }

  const employee = await prisma.employee.create({
    data: {
      ...rest,
      passwordHash: hashPassword(resolvedPassword)
    }
  });

  return sanitizeEmployee(employee);
};

exports.loginEmployee = async ({ email, password }) => {
  if (!email || !password) {
    throw new Error('email and password are required');
  }

  const employee = await prisma.employee.findUnique({
    where: { email }
  });

  if (!employee || !employee.isActive) {
    throw new Error('Invalid credentials');
  }

  if (!verifyPassword(password, employee.passwordHash)) {
    throw new Error('Invalid credentials');
  }

  const token = signToken({
    employeeId: employee.id,
    storeId: employee.storeId,
    email: employee.email,
    role: employee.role
  });

  await prisma.employee.update({
    where: { id: employee.id },
    data: { lastLoginAt: new Date() }
  });

  return {
    token,
    employee: sanitizeEmployee(employee)
  };
};

exports.getEmployees = async () => {
  const employees = await prisma.employee.findMany({
    orderBy: { id: 'desc' }
  });

  return employees.map(sanitizeEmployee);
};

exports.getEmployeeById = async (id) => {
  const employee = await prisma.employee.findUnique({
    where: { id: Number(id) }
  });

  return sanitizeEmployee(employee);
};

exports.updateEmployee = async (id, data) => {
  const updateData = { ...data };

  if (updateData.password) {
    updateData.passwordHash = hashPassword(updateData.password);
    delete updateData.password;
  }

  if (updateData.passwordHash) {
    delete updateData.passwordHash;
  }

  const employee = await prisma.employee.update({
    where: { id: Number(id) },
    data: updateData
  });

  return sanitizeEmployee(employee);
};

exports.deleteEmployee = async (id) => {
  return prisma.employee.delete({
    where: { id: Number(id) }
  });
};

exports.getCurrentEmployee = async (employeeId) => {
  const employee = await prisma.employee.findUnique({
    where: { id: Number(employeeId) }
  });

  return sanitizeEmployee(employee);
};